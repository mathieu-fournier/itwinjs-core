/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AddSceneObjectArgs, TiledGraphicsSceneObject, TiledGraphicsSceneObjects } from "../SceneObject";
import { ViewportScene } from "../ViewportScene";
import { SceneObjectImpl } from "./SceneObjectImpl";
import { TiledGraphicsProvider } from "../../tile/internal";
import { HitDetail } from "../../HitDetail";
import { SceneContext } from "../../ViewContext";
import { Guid, GuidString } from "@itwin/core-bentley";

export class TiledGraphicsSceneObjectImpl extends SceneObjectImpl<ViewportScene> implements TiledGraphicsSceneObject {
  public readonly graphicsProvider: TiledGraphicsProvider;

  constructor(guid: GuidString, scene: ViewportScene, provider: TiledGraphicsProvider) {
    super(guid, scene);
    this.graphicsProvider = provider;
  }

  override draw(context: SceneContext): void {
    TiledGraphicsProvider.addToScene(this.graphicsProvider, context);
  }

  override get isLoadingComplete(): boolean {
    return TiledGraphicsProvider.isLoadingComplete(this.graphicsProvider, this.scene.viewport);
  }

  override async getToolTip(_hit: HitDetail): Promise<HTMLElement | string | undefined> {
    // ###TODO TiledGraphicsProvider never supported tooltips. Any reason to bother adding it now?
    return Promise.resolve(undefined);
  }
}

export class TiledGraphicsSceneObjectsImpl implements TiledGraphicsSceneObjects {
  private readonly _scene: ViewportScene;
  private readonly _objects: TiledGraphicsSceneObject[] = [];
  
  constructor(scene: ViewportScene) {
    this._scene = scene;
  }

  private findIndex(provider: TiledGraphicsProvider): number {
    return this._objects.findIndex((x) => x.graphicsProvider === provider);
  }

  [Symbol.iterator]() {
    return this._objects[Symbol.iterator]();
  }

  find(provider: TiledGraphicsProvider): TiledGraphicsSceneObject | undefined {
    const index = this.findIndex(provider);
    return index !== -1 ? this._objects[index] : undefined;
  }

  add(provider: TiledGraphicsProvider, options?: AddSceneObjectArgs): TiledGraphicsSceneObject {
    let object = this.find(provider);
    if (object) {
      // ###TODO log a warning?
      return object;
    }

    object = new TiledGraphicsSceneObjectImpl(options?.guid ?? Guid.createValue(), this._scene, provider);
    this._objects.push(object);
    this._scene.onContentsChanged.raiseEvent(object, "add");
    return object;
  }

  delete(object: TiledGraphicsSceneObject): void {
    const index = this._objects.indexOf(object);
    if (-1 === index) {
      // ###TODO log warning?
      return;
    }

    this._objects.splice(index, 1);
    this._scene.onContentsChanged.raiseEvent(object, "delete");
  }

  drop(provider: TiledGraphicsProvider): void {
    const index = this.findIndex(provider);
    if (-1 !== index) {
      const object = this._objects[index];
      this._objects.splice(index, 1);
      this._scene.onContentsChanged.raiseEvent(object, "delete");
    }
  }

  clear(): void {
    for (let i = this._objects.length - 1; i >= 0; i++) {
      const object = this._objects[i];
      this._objects.length = i;
      this._scene.onContentsChanged.raiseEvent(object, "delete");
    }
  }

  private * _getProviders() {
    for (const object of this)
      yield object.graphicsProvider;
  }

  get providers(): Iterable<TiledGraphicsProvider> {
    return this._getProviders();
  }
}
