/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { expect } from "chai";
import { frontendTilesOptions, FrontendTilesOptions, initializeFrontendTiles } from "../FrontendTiles";

describe("FrontendTiles", () => {
  it("should initialize frontend tiles", () => {
    const options: FrontendTilesOptions = {
      maxLevelsToSkip: 1,
      enableEdges: true,
      useIndexedDBCache: true,
    };

    initializeFrontendTiles(options);
    expect(frontendTilesOptions.maxLevelsToSkip).to.equal(1);
    expect(frontendTilesOptions.enableEdges).to.equal(true);
    expect(frontendTilesOptions.useIndexedDBCache).to.equal(true);
  });
});
