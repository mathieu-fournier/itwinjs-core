/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AccessToken } from "@itwin/core-bentley";
import { IModelApp, IModelConnection, SpatialTileTreeReferences, SpatialViewState } from "@itwin/core-frontend";
import { Logger } from "@itwin/core-bentley";
import { createBatchedSpatialTileTreeReferences } from "../../BatchedSpatialTileTreeRefs";
import { loggerCategory } from "../../LoggerCategory";
import { obtainIModelTilesetUrlFromProvider, ObtainIModelTilesetUrlFromProviderArgs, IModelTilesetOptions } from "../providers/IModelTileset";
import { initRealityDataTilesetFromUrl } from "./RealityModelTileset";


/** Arguments supplied  to [[obtainMeshExportTilesetUrl]].
 * @beta
 */
export interface ObtainIModelTilesetUrlArgs {
  /** The iModel for which to obtain a tileset URl. */
  iModel: IModelConnection;

  /** The token used to access the mesh export service. */
  accessToken: AccessToken;

  /** The options for the iModel tileset. */
  options: IModelTilesetOptions;
}

/** Obtains a URL pointing to a tileset appropriate for visualizing a specific iModel.
 * [[queryCompletedMeshExports]] is used to obtain a list of available exports. By default, the list is sorted from most to least recently-exported.
 * The first export matching the iModel's changeset is selected; or, if no such export exists, the first export in the list is selected.
 * @returns A URL from which the tileset can be loaded, or `undefined` if no appropriate URL could be obtained.
 * @beta
 */
export async function obtainIModelTilesetUrl(args: ObtainIModelTilesetUrlArgs): Promise<URL | undefined> {
  if (!args.iModel.iModelId) {
    Logger.logInfo(loggerCategory, "Cannot obtain Graphics Data for an iModel with no iModelId");
    return undefined;
  }

  if (!args.iModel.iTwinId) {
    Logger.logInfo(loggerCategory, "Cannot obtain Graphics Data for an iModel with no iTwinId");
    return undefined;
  }

  const graphicsArgs: ObtainIModelTilesetUrlFromProviderArgs = {
    accessToken: args.accessToken,
    dataSource: {
      iTwinId: args.iModel.iTwinId,
      iModelId: args.iModel.iModelId,
      changesetId: args.iModel.changeset.id,
    },
    options: args.options,
  };

  return obtainIModelTilesetUrlFromProvider(graphicsArgs);
}


/** A function that can provide the base URL where a tileset representing all of the spatial models in a given iModel are stored.
 * The tileset is expected to reside at "baseUrl/tileset.json" and to have been produced by the [mesh export service](https://developer.bentley.com/apis/mesh-export/).
 * If no such tileset exists for the given iModel, return `undefined`.
 * @see [[FrontendTilesOptions.computeSpatialTilesetBaseUrl]].
 * @beta
 */
export type ComputeSpatialTilesetBaseUrl = (iModel: IModelConnection) => Promise<URL | undefined>;

/** Options supplied to [[initIModelTiles]].
 * @beta
 */
export interface InitIModelTilesArgs {
  /** Provide the base URL for the pre-published tileset for a given iModel.
   * If omitted, [[obtainMeshExportTilesetUrl]] will be invoked with default arguments, using the access token provided by [[IModelApp]].
   */
  computeSpatialTilesetBaseUrl?: ComputeSpatialTilesetBaseUrl;
  /** The maximum number of levels in the tile tree to skip loading if they do not provide the desired level of detail for the current view.
   * Default: 4.
   * Reducing this value will load more intermediate tiles, which causes more gradual refinement: low-resolution tiles will display quickly, followed more gradually by
   * successively higher-resolution ones.
   * Increasing the value jumps more directly to tiles of the exact level of detail desired, which may load more, smaller tiles up-front, leaving some areas of the view
   * vacant for longer; and when zooming out some newly-exposed areas of the view may remain vacant for longer because no lower-resolution tiles are initially available to
   * fill them. However, tiles close to the viewer (and therefore likely of most interest to them) will refine to an appropriate level of detail more quickly.
   */
  maxLevelsToSkip?: number;
  /** Specifies whether to permit the user to enable visible edges or wireframe mode for batched tiles.
   * The currently-deployed mesh export service does not produce edges, so this currently defaults to `false` to avoid user confusion.
   * Set it to `true` if you are loading tiles created with a version of the exporter that does produce edges.
   * ###TODO delete this option once we deploy an edge-producing version of the exporter to production.
   * @internal
   */
  enableEdges?: boolean;
  /** Specifies whether to enable a CDN (content delivery network) to access tiles faster.
   * This option is only used if computeSpatialTilesetBaseUrl is not defined.
   * @beta
   */
  enableCDN?: boolean;
  /** Specifies whether to enable an IndexedDB database for use as a local cache.
  * Requested tiles will then first be search for in the database, and if not found, fetched as normal.
  * @internal
  */
  useIndexedDBCache?: boolean;
}

/** Global configuration initialized by [[initializeFrontendTiles]].
 * @internal
 */
export const frontendTilesOptions = {
  maxLevelsToSkip: 4,
  enableEdges: false,
  useIndexedDBCache: false,
};

/**
 * Initializes the IModelTiles with the provided options.
 * @beta
 */
export function initIModelTiles(options: InitIModelTilesArgs): void {
  if (undefined !== options.maxLevelsToSkip && options.maxLevelsToSkip >= 0)
    frontendTilesOptions.maxLevelsToSkip = options.maxLevelsToSkip;

  if (options.enableEdges)
    frontendTilesOptions.enableEdges = true;

  if (options.useIndexedDBCache)
    frontendTilesOptions.useIndexedDBCache = true;

  const computeUrl = options.computeSpatialTilesetBaseUrl ?? (
    async (iModel: IModelConnection) => obtainIModelTilesetUrl({ iModel, accessToken: await IModelApp.getAccessToken(), options: { enableCDN: options.enableCDN, cesium3DTiles: false } })
  );

  SpatialTileTreeReferences.create = (view: SpatialViewState) => createBatchedSpatialTileTreeReferences(view, computeUrl);
}

export type InitIModelTilesetUrlArgs = ObtainIModelTilesetUrlArgs;

/** Initializes the IModelTiles using 3D Tiles format, with the provided options.
 * @beta
 */
export async function initIModelTilesAs3DTiles(args: InitIModelTilesetUrlArgs): Promise<void> {
  try {
    const url = await obtainIModelTilesetUrl(args);
    if (url) {
      initRealityDataTilesetFromUrl(url.toString());
    } else {
      throw new Error("Failed to obtain tileset URL");
    }
  } catch (error) {
    throw error;
  }
}

