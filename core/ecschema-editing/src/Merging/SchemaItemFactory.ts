/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { EntityClass, Enumeration, PropertyCategory, Schema, SchemaItem, StructClass } from "@itwin/ecschema-metadata";

export namespace SchemaItemFactory {

  export async function create(template: SchemaItem, targetSchema: Schema): Promise<SchemaItem> {
    if (is(template, Enumeration))
      return new Enumeration(targetSchema, template.name, template.type);
    if (is(template, EntityClass))
      return new EntityClass(targetSchema, template.name, template.modifier);
    if (is(template, StructClass))
      return new StructClass(targetSchema, template.name, template.modifier);
    if(is(template, PropertyCategory))
      return new PropertyCategory(targetSchema, template.name);

    throw new Error(`Unsupported Schema Item Type: ${template.constructor.name}`);

  }

  function is<T extends SchemaItem>(item: SchemaItem, type: new (...args: any) => T ): item is T {
    return item instanceof type;
  }
}
