/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { type CustomAttributeClassDifference } from "../Differencing/SchemaDifference";
import { type SchemaMergerHandler } from "./SchemaItemMerger";
import { type MutableCAClass } from "../Editing/Mutable/MutableCAClass";
import { containerTypeToString, parseCustomAttributeContainerType } from "@itwin/ecschema-metadata";
import { modifyClass } from "./ClassMerger";

/**
 * @internal
 */
export const customAttributeClassMerger: SchemaMergerHandler<CustomAttributeClassDifference> = {
  async add(context, change) {
    return context.editor.customAttributes.createFromProps(context.targetSchemaKey, {
      name: change.itemName,
      ...change.difference,
    });
  },
  async modify(context, change, itemKey, item: MutableCAClass) {
    if(change.difference.appliesTo) {
      const currentValue = containerTypeToString(item.containerType);
      if (currentValue !== "" && change.difference.appliesTo !== currentValue) {
        const containerType = parseCustomAttributeContainerType(`${currentValue}, ${change.difference.appliesTo}`);
        if (containerType === undefined) {
          return { errorMessage: "An invalid custom attribute class containerType has been provided."};
        }
        item.setContainerType(containerType);
      }
    }
    return modifyClass(context, change, itemKey, item);
  },
};
