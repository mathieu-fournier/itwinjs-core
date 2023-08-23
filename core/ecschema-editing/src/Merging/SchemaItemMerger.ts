/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SchemaItem } from "@itwin/ecschema-metadata";
import { ChangeType, PropertyValueChange, SchemaItemChanges } from "../Validation/SchemaChanges";
import { MutableSchema } from "../Editing/Mutable/MutableSchema";
import { SchemaItemFactory } from "./SchemaItemFactory";
import { SchemaMergeContext } from "./SchemaMerger";

type SchemaItemMergeFn<TChange extends SchemaItemChanges, TItem extends SchemaItem> = (target: TItem, source: TItem, change: TChange, context: SchemaMergeContext) => Promise<void>;

abstract class MutableSchemaItem extends SchemaItem{
  public abstract override setDisplayLabel(displayLabel: string): void;
  public abstract override setDescription(description: string): void;
}

/**
   *
   * @param context
   * @param schemaItemChanges
   * @param mergeFn
   */
export default async function mergeSchemaItems<TChange extends SchemaItemChanges, TItem extends SchemaItem>(context: SchemaMergeContext, schemaItemChanges: Iterable<TChange>, mergeFn?: SchemaItemMergeFn<TChange, TItem>) {
  for(const change of schemaItemChanges) {

    // Gets the source and the target item. The target item could be undefined at that point.
    const sourceItem = (await context.sourceSchema.getItem<TItem>(change.ecTypeName))!;
    let targetItem = await context.targetSchema.getItem<TItem>(change.ecTypeName);

    // In case the schema item does not exists in the target schema, an instance for
    // this schema item is created. It's properties get set by the merger then.
    if(change.schemaItemMissing?.changeType === ChangeType.Missing) {
      // Check for name to make sure there is no collision for items with the same name
      // but different type.
      if(targetItem !== undefined) {
        throw new Error(`Schema ${context.targetSchema.name} already contains a Schema Item ${change.ecTypeName}.`);
      }

      // TODO: Think about renaming the Schema Item. This could be controlled though a flag.

      const createdItem = await SchemaItemFactory.create(sourceItem, context.targetSchema) as TItem;
      (context.targetSchema as MutableSchema).addItem(targetItem = createdItem);
    }

    // Sets the Schema items base properties...
    await mergeSchemaItemProperties(targetItem!, change.propertyValueChanges);

    if(mergeFn) {
      await mergeFn(targetItem!, sourceItem, change, context);
    }
  }
}

async function mergeSchemaItemProperties(targetItem: SchemaItem, changes: Iterable<PropertyValueChange>) {
  const mutableSchemaItem = targetItem as MutableSchemaItem;
  for(const change of changes) {
    const [propertyName, propertyValue] = change.diagnostic.messageArgs!;
    mergeSchemaItemProperty(mutableSchemaItem, propertyName, propertyValue);
  }
}

function mergeSchemaItemProperty(item: MutableSchemaItem, propertyName: string, propertyValue: any): void {
  // Start with label and description, both can be set through a setter method in the
  // MutableSchemaItem class.
  switch(propertyName) {
    case "label":
      return item.setDisplayLabel(propertyValue);
    case "description":
      return item.setDescription(propertyValue);

    // The following properties are known and shall or cannot be set after initialization.
    case "schemaItemType":
    case "modifier":
      return;
  }

  // Other properties might also have a setter method which is usually following the
  // pattern of set<PropertyName>(<PropertyValue>).
  const setterCandidate = findSetter(item, propertyName);
  if(setterCandidate) {
    return setterCandidate.call(item, propertyValue);
  }
}

function findSetter(item: SchemaItem&{[name: string]: any}, propertyName: string): ((value: any) => void) | undefined {
  return item[`set${propertyName.charAt(0).toUpperCase()}${propertyName.slice(1)}`];
}
