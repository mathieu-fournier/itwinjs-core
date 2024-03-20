/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { type EntityClassDifference, EntityClassMixinDifference } from "../Differencing/SchemaDifference";
import { type SchemaItemMergerHandler, updateSchemaItemKey } from "./SchemaItemMerger";
import { type MutableEntityClass } from "../Editing/Mutable/MutableEntityClass";
import { modifyClass } from "./ClassMerger";

type EntityChangeType = EntityClassDifference | EntityClassMixinDifference;

/**
 * Defines a merge handler to merge Entity Class schema items.
 * @internal
 */
export const entityClassMerger: SchemaItemMergerHandler<EntityChangeType> = {
  async add(context, change) {
    return context.editor.entities.createFromProps(context.targetSchemaKey, {
      name: change.itemName,
      schemaItemType: change.schemaType,

      ...change.difference,
    });
  },
  async modify(context, change, itemKey, item: MutableEntityClass) {
    if(isMixinDifference(change)) {
      return { errorMessage: `Changing the entity class '${itemKey.name}' mixins is not supported.`};
    }
    if(change.difference.mixins) {
      for(const mixin of change.difference.mixins) {
        const mixinKey = await updateSchemaItemKey(context, mixin);
        const result = await context.editor.entities.addMixin(itemKey, mixinKey);
        if(result.errorMessage) {
          return result;
        }
      }
    }

    return modifyClass(context, change, itemKey, item);
  },
};

function isMixinDifference(change: EntityChangeType): change is EntityClassMixinDifference {
  return "path" in change && change.path === "$mixins";
}
