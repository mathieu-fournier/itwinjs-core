/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module RpcInterface
 */

import type { TransferConfig } from "@itwin/object-storage-core/lib/common";
import { Id64Array } from "@itwin/core-bentley";
import { RpcResponseCacheControl } from "./core/RpcConstants";
import { RpcOperation } from "./core/RpcOperation";
import { IModelRpcProps } from "../IModel";
import { RpcInterface } from "../RpcInterface";
import { RpcManager } from "../RpcManager";
import { ElementGraphicsRequestProps } from "../tile/ElementGraphics";
import {
  IModelTileTreeProps,
  TileContentIdentifier,
  TileContentSource,
  TileVersionInfo,
} from "../TileProps";

/** @public */
export abstract class IModelTileRpcInterface extends RpcInterface {
  // eslint-disable-line deprecation/deprecation
  public static getClient(): IModelTileRpcInterface {
    return RpcManager.getClientForInterface(IModelTileRpcInterface);
  }

  /** The immutable name of the interface. */
  public static readonly interfaceName = "IModelTileRpcInterface";

  /** The semantic version of the interface. */
  public static interfaceVersion = "3.2.0";

  /*===========================================================================================
    NOTE: Any add/remove/change to the methods below requires an update of the interface version.
    NOTE: Please consult the README in this folder for the semantic versioning rules.
  ===========================================================================================*/

  /** Get storage config required to download tiles from the tile cache.
   * @returns undefined if the backend does not support caching. In that case, tiles must be requested using [[generateTileContent]].
   * @beta
   */
  public async getTileCacheConfig(
    _tokenProps: IModelRpcProps
  ): Promise<TransferConfig | undefined> {
    const response = await this.forward(arguments);
    return (
      response && { ...response, expiration: new Date(response.expiration) }
    );
  }

  /** @internal */
  @RpcOperation.allowResponseCaching(RpcResponseCacheControl.Immutable) // eslint-disable-line deprecation/deprecation
  public async requestTileTreeProps(
    _tokenProps: IModelRpcProps,
    _id: string
  ): Promise<IModelTileTreeProps> {
    return this.forward(arguments);
  }

  /** Ask the backend to generate content for the specified tile. This function, unlike the deprecated `requestTileContent`, does not check the cloud storage tile cache -
   * Use `CloudStorageTileCache.retrieve` for that.
   * @returns TileContentSource - if Backend, use retrieveTileContent. If ExternalCache, use TileAdmin.requestCachedTileContent
   * @internal
   */
  public async generateTileContent(
    _rpcProps: IModelRpcProps,
    _treeId: string,
    _contentId: string,
    _guid: string | undefined
  ): Promise<TileContentSource> {
    return this.forward(arguments);
  }

  /** Retrieves tile content from the backend once it's generated by generateTileContent.
   *  @internal
   */
  public async retrieveTileContent(
    _rpcProps: IModelRpcProps,
    _key: TileContentIdentifier
  ): Promise<Uint8Array> {
    return this.forward(arguments);
  }

  /** @internal */
  public async queryVersionInfo(): Promise<TileVersionInfo> {
    return this.forward(arguments);
  }

  /** This is a temporary workaround for folks developing authoring applications, to be removed when proper support for such applications is introduced.
   * Given a set of model Ids, it purges any associated tile tree state on the back-end so that the next request for the tile tree or content will recreate that state.
   * Invoked after a modification is made to the model(s).
   * If no array of model Ids is supplied, it purges *all* tile trees, which can be quite inefficient.
   * @internal
   */
  public async purgeTileTrees(
    _tokenProps: IModelRpcProps,
    _modelIds: Id64Array | undefined
  ): Promise<void> {
    return this.forward(arguments);
  }

  /** Requests graphics for a single element in "iMdl" format.
   * @returns graphics in iMdl format, or `undefined` if the element's geometry produced no graphics or the request was canceled before completion.
   * @throws IModelError on bad request (nonexistent element, duplicate request Id, etc).
   * @internal
   */
  public async requestElementGraphics(
    _rpcProps: IModelRpcProps,
    _request: ElementGraphicsRequestProps
  ): Promise<Uint8Array | undefined> {
    return this.forward(arguments);
  }
}
