/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point3d, Vector3d } from "@itwin/core-geometry";
import { ColorDef } from "@itwin/core-common";
import { BeButtonEvent, BeModifierKeys, DecorateContext, EventHandled, GraphicType, IModelApp, NotifyMessageDetails, OutputMessagePriority, PrimitiveTool } from "@itwin/core-frontend";


interface LocationData {
  point: Point3d;
  normal?: Vector3d;
}

/** Demonstrates draping line strings on terrain meshes.  The terrain can be defined by map terrain (from Cesium World Terrain) or a reality model.
 */
export class AGTestTool extends PrimitiveTool {
  public static override toolId = "AGTestTool";

  private _locations: LocationData[] = [];

  public override requireWriteableTarget(): boolean {
    return false;
  }

  public override async onPostInstall() {
    await super.onPostInstall();
    IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info,
      "Started test tool.\nHold CTRL while dragging mouse to capture points."));
    this.setupAndPromptForNextAction();
  }

  public override async onUnsuspend(): Promise<void> {
    this.setupAndPromptForNextAction();
  }

  public override decorate(context: DecorateContext): void {
    this.createDecorations(context);
  }

  public override decorateSuspended(context: DecorateContext): void {
    this.createDecorations(context);
  }

  private createDecorations(context: DecorateContext): void {
    if (0 === this._locations.length) {
      return;
    }

    const colors = [ColorDef.red, ColorDef.green, ColorDef.blue, ColorDef.white];

    const builder = context.createGraphicBuilder(GraphicType.Scene);

    for (let i = 0; i < this._locations.length; ++i) {
      const color = colors[i % colors.length];
      builder.setSymbology(color, color, 5);
      builder.addPointString([this._locations[i].point]);

      // Add a line to represent the normal
      if (undefined !== this._locations[i].normal) {
        builder.setSymbology(color, color, 1);
        const tip = this._locations[i].point.plus(this._locations[i].normal!);
        builder.addLineString([this._locations[i].point, tip]);
      }
    }
    context.addDecorationFromBuilder(builder);
  }

  private setupAndPromptForNextAction(): void {
    this.initLocateElements(false, true);
  }

  private addLocation(ev: BeButtonEvent): void {
    const snap = IModelApp.accuSnap.getCurrSnapDetail();
    if (snap) {
      this._locations.push({ point: ev.point.clone(), normal: snap.normal?.clone() });
    }
  }

  public override async onMouseMotion(ev: BeButtonEvent): Promise<void> {
    if (ev.isControlKey) {
      this.addLocation(ev);
    }
    if (ev.viewport) {
      ev.viewport.invalidateDecorations();
    }
  }

  public override async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    await this.onRestartTool()
    return EventHandled.Yes;
  }

  public override async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    this.addLocation(ev);
    if (ev.viewport) {
      ev.viewport.invalidateDecorations();
    }

    this.setupAndPromptForNextAction();
    return EventHandled.Yes;
  }

  public override async onRestartTool(): Promise<void> {
    const tool = new AGTestTool();
    if (!await tool.run()) {
      await this.exitTool();
    }
  }

  public override async parseAndRun(..._args: string[]): Promise<boolean> {
    return this.run();
  }
}
