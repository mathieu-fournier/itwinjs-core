/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp, IModelConnection } from "@itwin/core-frontend";
import { obtainGraphicsDataSourceUrl } from "./GraphicsServiceProvider";
import { AccessToken, Logger } from "@itwin/core-bentley";
import { loggerCategory } from "./LoggerCategory";

/** Arguments supplied  to [[obtainMeshExportTilesetUrl]].
 * @beta
 */
export interface ObtainIModelTilesetUrlArgs{
  /** The iModel for which to obtain a tileset URl. */
  iModel: IModelConnection;
  /** The token used to access the mesh export service. */
  accessToken: AccessToken;
  /** Chiefly used in testing environments. */
  urlPrefix?: string;
  /** If true, only exports produced for `iModel`'s specific changeset will be considered; otherwise, if no exports are found for the changeset,
     * the most recent export for any changeset will be used.
     */
  requireExactChangeset?: boolean;
  /** If true, enables a CDN (content delivery network) to access tiles faster. */
  enableCDN?: boolean;
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

  const graphicsArgs = {
    accessToken: args.accessToken,
    sessionId: IModelApp.sessionId,
    sourceId: args.iModel.iModelId,
    sourceVersionId: args.iModel.changeset.id,
    sourceType: "IMODEL",
    urlPrefix: args.urlPrefix,
    requireExactVersion: args.requireExactChangeset,
    enableCDN: args.enableCDN,
  };

  return obtainGraphicsDataSourceUrl(graphicsArgs);
}
