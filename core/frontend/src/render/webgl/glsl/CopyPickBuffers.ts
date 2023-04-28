/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module WebGL
 */

import { CopyPickBufferGeometry } from "../CachedGeometry";
import { TextureUnit } from "../RenderFlags";
import { FragmentShaderComponent, VariablePrecision, VariableType } from "../ShaderBuilder";
import { ShaderProgram } from "../ShaderProgram";
import { Texture2DHandle } from "../Texture";
import { createViewportQuadBuilder } from "./ViewportQuad";

const computeBaseColor = "return vec4(1.0);";

const assignFragData = `
  FragColor0 = TEXTURE(u_pickFeatureId, v_texCoord);
  FragColor1 = TEXTURE(u_pickDepthAndOrder, v_texCoord);
`;

/** @internal */
export function createCopyPickBuffersProgram(context: WebGL2RenderingContext): ShaderProgram {
  const builder = createViewportQuadBuilder(true);
  const frag = builder.frag;

  frag.set(FragmentShaderComponent.ComputeBaseColor, computeBaseColor);

  frag.addUniform(
    "u_pickFeatureId",
    VariableType.Sampler2D,
    (prog) => {
      prog.addGraphicUniform("u_pickFeatureId", (uniform, params) => {
        Texture2DHandle.bindSampler(uniform, (params.geometry as CopyPickBufferGeometry).featureId, TextureUnit.Zero);
      });
    },
    VariablePrecision.High
  );

  frag.addUniform(
    "u_pickDepthAndOrder",
    VariableType.Sampler2D,
    (prog) => {
      prog.addGraphicUniform("u_pickDepthAndOrder", (uniform, params) => {
        Texture2DHandle.bindSampler(
          uniform,
          (params.geometry as CopyPickBufferGeometry).depthAndOrder,
          TextureUnit.One
        );
      });
    },
    VariablePrecision.High
  );

  frag.addDrawBuffersExtension(2);
  frag.set(FragmentShaderComponent.AssignFragData, assignFragData);

  builder.vert.headerComment = "//!V! CopyPickBuffers";
  builder.frag.headerComment = "//!F! CopyPickBuffers";

  return builder.buildProgram(context);
}
