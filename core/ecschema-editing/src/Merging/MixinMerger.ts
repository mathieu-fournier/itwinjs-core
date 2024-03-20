/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { type MixinClassDifference } from "../Differencing/SchemaDifference";
import { type SchemaItemMergerHandler, updateSchemaItemFullName, updateSchemaItemKey } from "./SchemaItemMerger";
import { type MutableMixin } from "../Editing/Mutable/MutableMixin";
import { modifyClass } from "./ClassMerger";

/**
 * Defines a merge handler to merge Mixin schema items.
 * @internal
 */
export const mixinClassMerger: SchemaItemMergerHandler<MixinClassDifference> = {
  async add(context, change) {
    return context.editor.mixins.createFromProps(context.targetSchemaKey, {
      name: change.itemName,
      schemaItemType: change.schemaType,

      ...change.difference,
      appliesTo: await updateSchemaItemFullName(context, change.difference.appliesTo),
    });
  },
  async modify(context, change, itemKey, item: MutableMixin) {
    if(change.difference.appliesTo) {
      const appliesTo = await updateSchemaItemKey(context, change.difference.appliesTo);
      const currentValue = await item.appliesTo;
      if (currentValue !== undefined && !appliesTo.matches(currentValue.key)) {
        return { errorMessage: `Changing the mixin '${itemKey.name}' appliesTo is not supported.` };
      }
    }
    return modifyClass(context, change, itemKey, item);
  },
};

