/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import type { SchemaEditResults } from "../ecschema-editing";
import type { SchemaMergeContext } from "./SchemaMerger";
import type { ClassItemDifference, ClassPropertyDifference, DifferenceType } from "../Differencing/SchemaDifference";
import { AnyProperty, AnyPropertyProps, ArrayPropertyProps, CustomAttribute, ECClass, Enumeration, EnumerationPropertyProps, NavigationPropertyProps, parsePrimitiveType, PrimitivePropertyProps, RelationshipClass, SchemaItemKey, SchemaItemType, schemaItemTypeToString, StructClass, StructPropertyProps } from "@itwin/ecschema-metadata";
import { updateSchemaItemFullName, updateSchemaItemKey } from "./SchemaItemMerger";
import { MutableProperty } from "../Editing/Mutable/MutableProperty";
import { MutableArrayProperty } from "../Editing/Mutable/MutableArrayProperty";
import { MutablePrimitiveOrEnumPropertyBase } from "../Editing/Mutable/MutablePrimitiveOrEnumProperty";
import { applyCustomAttributes } from "./CustomAttributeMerger";

type Editable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface PropertyMerger<T extends AnyPropertyProps> {
  is(property: AnyPropertyProps): property is T;
  add(context: SchemaMergeContext, itemKey: SchemaItemKey, props: Editable<T>): Promise<SchemaEditResults>;
  merge(context: SchemaMergeContext, itemKey: SchemaItemKey, property: AnyProperty, props: T): Promise<SchemaEditResults>;
}

/**
 * @internal
 */
export async function mergePropertyDifference(context: SchemaMergeContext, change: ClassPropertyDifference): Promise<SchemaEditResults> {
  const classKey = new SchemaItemKey(change.itemName, context.targetSchemaKey);
  return mergeClassProperty(context, change, classKey, Object.assign(change.difference, { name: change.path }));
}

/**
 * @internal
 */
export async function mergeClassProperties(context: SchemaMergeContext, change: ClassItemDifference, itemKey: SchemaItemKey): Promise<SchemaEditResults> {
  for(const property of change.difference.properties || []) {
    const result = await mergeClassProperty(context, change, itemKey, property);
    if(result.errorMessage) {
      return result;
    }
  }
  return {};
}

async function mergeClassProperty(context: SchemaMergeContext, change: { changeType: DifferenceType }, itemKey: SchemaItemKey, property: AnyPropertyProps) {
  return change.changeType === "add"
    ? addClassProperty(context, itemKey, property)
    : modifyClassProperty(context, itemKey, property);
}

async function addClassProperty(context: SchemaMergeContext, itemKey: SchemaItemKey, property: Editable<AnyPropertyProps>): Promise<SchemaEditResults> {

  if(property.category !== undefined) {
    property.category = await updateSchemaItemFullName(context, property.category);
  }

  const createResult = await createProperty(context, itemKey, property);
  if(createResult.errorMessage) {
    return createResult;
  }

  if(property.customAttributes !== undefined) {
    const result = await applyCustomAttributes(context, property.customAttributes as CustomAttribute[], async (ca) => {
      return context.editor.entities.addCustomAttributeToProperty(itemKey, property.name, ca);
    });
    if(result.errorMessage) {
      return result;
    }
  }

  return {};
}

async function createProperty(context: SchemaMergeContext, itemKey: SchemaItemKey, property: Editable<AnyPropertyProps>) {
  if(enumerationProperty.is(property)) {
    return enumerationProperty.add(context, itemKey, property);
  }
  if(navigationProperty.is(property)) {
    return navigationProperty.add(context, itemKey, property);
  }
  if(primitiveProperty.is(property)) {
    return primitiveProperty.add(context, itemKey, property);
  }
  if(structProperty.is(property)) {
    return structProperty.add(context, itemKey, property);
  }
  return {};
}

async function modifyClassProperty(context: SchemaMergeContext, itemKey: SchemaItemKey, propertyProps: AnyPropertyProps): Promise<SchemaEditResults> {
  const ecClass  = await context.editor.schemaContext.getSchemaItem(itemKey) as ECClass;
  const property = await ecClass.getProperty(propertyProps.name) as MutableProperty;
  if(property === undefined) {
    return { errorMessage: `Couldn't find property ${propertyProps.name} on class ${itemKey.name}` };
  }

  if(propertyProps.type) {
    return { errorMessage: `Changing the property '${property.fullName}' type is not supported.` };
  }
  if(propertyProps.kindOfQuantity) {
    return { errorMessage: `Changing the property '${property.fullName}' kind of quantity is not supported.` };
  }

  if(propertyProps.description) {
    property.setDescription(propertyProps.description);
  }
  if(propertyProps.label) {
    property.setLabel(propertyProps.label);
  }
  if(propertyProps.isReadOnly) {
    property.setIsReadOnly(propertyProps.isReadOnly);
  }
  if(propertyProps.priority) {
    property.setPriority(propertyProps.priority);
  }

  if(property.isArray()) {
    await arrayProperty.merge(property as any, propertyProps);
  }

  if(propertyProps.category) {
    const categoryKey = await updateSchemaItemKey(context, propertyProps.category);
    await context.editor.entities.setPropertyCategory(itemKey, property.name, categoryKey);
  }

  if(property.isEnumeration()) {
    return enumerationProperty.merge(context, itemKey, property, propertyProps as any);
  }
  if(property.isNavigation()) {
    return navigationProperty.merge(context, itemKey, property, propertyProps as any);
  }
  if(property.isPrimitive()) {
    return primitiveProperty.merge(context, itemKey, property, propertyProps as any);
  }
  if(property.isStruct()) {
    return structProperty.merge(context, itemKey, property, propertyProps as any);
  }

  return {};
}

const arrayProperty = {
  is(property: AnyPropertyProps): boolean {
    return "minOccurs" in property;
  },
  async merge(property: MutableArrayProperty, props: ArrayPropertyProps) {
    if(props.minOccurs) {
      property.setMinOccurs(props.minOccurs);
    }
    if(props.maxOccurs) {
      property.setMaxOccurs(props.maxOccurs);
    }
  },
};

const enumerationProperty: PropertyMerger<EnumerationPropertyProps> = {
  is(property): property is EnumerationPropertyProps {
    return primitiveProperty.is(property) && property.typeName.includes(".");
  },
  async add(context, itemKey, property): Promise<SchemaEditResults>  {
    const enumerationKey = await updateSchemaItemKey(context, property.typeName);
    const enumerationType = await context.editor.schemaContext.getSchemaItem<Enumeration>(enumerationKey);
    if(enumerationType === undefined) {
      return { errorMessage: `Unable to locate the enumeration class ${enumerationKey.name} in the context schema.` };
    }

    property.typeName = enumerationKey.fullName;

    return arrayProperty.is(property)
      ? context.editor.entities.createEnumerationArrayPropertyFromProps(itemKey, property.name, enumerationType, property)
      : context.editor.entities.createEnumerationPropertyFromProps(itemKey, property.name, enumerationType, property);
  },
  async merge(context, itemKey, property, props) {
    if("enumeration" in props) {
      return { errorMessage: `Changing the property '${property.fullName}' enumeration is not supported.` };
    }
    return primitiveProperty.merge(context, itemKey, property, props);
  },
};

const navigationProperty: PropertyMerger<NavigationPropertyProps> = {
  is(property): property is NavigationPropertyProps {
    return property.type === "NavigationProperty";
  },
  async add(context, itemKey, property): Promise<SchemaEditResults>  {
    const relationshipKey = await updateSchemaItemKey(context, property.relationshipName);
    const relationshipType = await context.editor.schemaContext.getSchemaItem<RelationshipClass>(relationshipKey);
    if(relationshipType === undefined) {
      return { errorMessage: `Unable to locate the relationship class ${relationshipKey.name} in the context schema.` };
    }

    property.relationshipName = relationshipKey.fullName;

    const ecClass = await context.editor.schemaContext.getSchemaItem(itemKey) as ECClass;
    if (ecClass.schemaItemType === SchemaItemType.EntityClass)
      return context.editor.entities.createNavigationPropertyFromProps(itemKey, property);
    if (ecClass.schemaItemType === SchemaItemType.Mixin)
      return context.editor.mixins.createNavigationPropertyFromProps(itemKey, property);
    if (ecClass.schemaItemType === SchemaItemType.RelationshipClass)
      return context.editor.relationships.createNavigationPropertyFromProps(itemKey, property);
    return { errorMessage: `Navigation property can't be added to ${schemaItemTypeToString(ecClass.schemaItemType)}.` };
  },
  async merge(_context, _itemKey, property, props) {
    if(props.direction) {
      return { errorMessage: `Changing the property '${property.fullName}' direction is not supported.` };
    }
    if("relationshipClass" in props) {
      return { errorMessage: `Changing the property '${property.fullName}' relationship class is not supported.` };
    }
    return {};
  },
};

const primitiveProperty: PropertyMerger<PrimitivePropertyProps> = {
  is(property): property is PrimitivePropertyProps {
    return property.type === "PrimitiveProperty" || property.type === "PrimitiveArrayProperty";
  },
  async add(context, itemKey, property): Promise<SchemaEditResults>  {
    const propertyType = parsePrimitiveType(property.typeName);
    if(propertyType === undefined) {
      return { errorMessage: `Invalid property type ${property.typeName} on property ${property.name}` };
    }

    if(property.kindOfQuantity) {
      property.kindOfQuantity = await updateSchemaItemFullName(context, property.kindOfQuantity);
    }

    return arrayProperty.is(property)
      ? context.editor.entities.createPrimitiveArrayPropertyFromProps(itemKey, property.name, propertyType, property)
      : context.editor.entities.createPrimitivePropertyFromProps(itemKey, property.name, propertyType, property);
  },
  async merge(_context, _itemKey, property, props) {
    const mutable = property as unknown as MutablePrimitiveOrEnumPropertyBase;
    if("primitiveType" in props) {
      return { errorMessage: `Changing the property '${property.fullName}' primitiveType is not supported.` };
    }

    if(props.extendedTypeName) {
      mutable.setExtendedTypeName(props.extendedTypeName);
    }
    if(props.minLength) {
      mutable.setMinLength(props.minLength);
    }
    if(props.maxLength) {
      mutable.setMaxLength(props.maxLength);
    }
    if(props.minValue) {
      mutable.setMinValue(props.minValue);
    }
    if(props.maxValue) {
      mutable.setMaxValue(props.maxValue);
    }
    return {};
  },
};

const structProperty: PropertyMerger<StructPropertyProps> = {
  is(property): property is StructPropertyProps {
    return property.type === "StructProperty" || property.type === "StructArrayProperty";
  },
  async add(context, itemKey, property): Promise<SchemaEditResults>  {
    const structKey = await updateSchemaItemKey(context, property.typeName);
    const structType = await context.editor.schemaContext.getSchemaItem<StructClass>(structKey);
    if(structType === undefined) {
      return { errorMessage: `Unable to locate the struct ${structKey.name} in the context schema.` };
    }

    property.typeName = structKey.fullName;

    return arrayProperty.is(property)
      ? context.editor.entities.createStructArrayPropertyFromProps(itemKey, property.name, structType, property)
      : context.editor.entities.createStructPropertyFromProps(itemKey, property.name, structType, property);
  },
  async merge(_context, _itemKey, property, props) {
    if("structClass" in props) {
      return { errorMessage: `Changing the property '${property.fullName}' structClass is not supported.` };
    }
    return {};
  },
};
