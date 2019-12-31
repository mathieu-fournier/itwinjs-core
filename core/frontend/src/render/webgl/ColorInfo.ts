/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module WebGL */

import { ColorIndex, ColorDef } from "@bentley/imodeljs-common";
import { assert } from "@bentley/bentleyjs-core";
import { FloatRgba } from "./FloatRGBA";
import { VertexTable } from "../primitives/VertexTable";

/* Describes a primitive's basic color properties
 * @internal
 */
export class ColorInfo {
  private readonly _uniform?: FloatRgba;
  public readonly hasTranslucency: boolean;

  private constructor(hasTranslucency: boolean, uniform?: FloatRgba) {
    this.hasTranslucency = hasTranslucency;
    this._uniform = uniform;
  }

  public static createUniform(color: FloatRgba) { return new ColorInfo(color.hasTranslucency, color); }
  public static createNonUniform(hasTranslucency: boolean) { return hasTranslucency ? this._nonUniformTranslucent : this._nonUniformOpaque; }
  public static createFromColorDef(color: ColorDef) { return this.createUniform(FloatRgba.fromColorDef(color)); }

  public static createFromColorIndex(colorIndex: ColorIndex) {
    return undefined !== colorIndex.uniform ? this.createFromColorDef(colorIndex.uniform) : this.createNonUniform(colorIndex.hasAlpha);
  }

  public static createFromVertexTable(vt: VertexTable) {
    return undefined !== vt.uniformColor ? this.createFromColorDef(vt.uniformColor) : this.createNonUniform(vt.hasTranslucency);
  }

  public get isUniform() { return undefined !== this._uniform; }
  public get isNonUniform() { return !this.isUniform; }
  public get uniform(): FloatRgba { assert(this.isUniform); return this._uniform!; }

  private static _nonUniformTranslucent = new ColorInfo(true);
  private static _nonUniformOpaque = new ColorInfo(false);
}
