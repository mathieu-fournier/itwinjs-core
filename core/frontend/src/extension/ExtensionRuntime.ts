/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Extensions
 */

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @itwin/no-internal-barrel-imports */
/* eslint-disable sort-imports */

import { ExtensionImpl } from "./ExtensionImpl";
import { ExtensionHost } from "./ExtensionHost";

const globalSymbol = Symbol.for("itwin.core.frontend.globals");
if ((globalThis as any)[globalSymbol]) throw new Error("Multiple @itwin/core-frontend imports detected!");

// BEGIN GENERATED CODE
import {
  // @public enum(s) from @itwin/core-frontend
  ACSDisplayOptions,
  ACSType,
  ActivityMessageEndReason,
  BeButton,
  BeModifierKeys,
  ClipEventType,
  ContextRotationId,
  CoordSource,
  CoordSystem,
  CoordinateLockOverrides,
  EventHandled,
  FlashMode,
  FrontendLoggerCategory,
  GraphicType,
  HitDetailType,
  HitGeomType,
  HitParentGeomType,
  HitPriority,
  HitSource,
  InputSource,
  KeyinParseError,
  LocateAction,
  LocateFilterStatus,
  ManipulatorToolEvent,
  MessageBoxIconType,
  MessageBoxType,
  MessageBoxValue,
  OutputMessageAlert,
  OutputMessagePriority,
  OutputMessageType,
  ParseAndRunResult,
  SelectionMethod,
  SelectionMode,
  SelectionProcessing,
  SelectionSetEventType,
  SnapHeat,
  SnapMode,
  SnapStatus,
  StandardViewId,
  StartOrResume,
  TileBoundingBoxes,
  TileGraphicType,
  TileLoadPriority,
  TileLoadStatus,
  TileTreeLoadStatus,
  TileVisibility,
  ToolAssistanceImage,
  ToolAssistanceInputMethod,
  UniformType,
  VaryingType,
  ViewStatus,
  // @public real(s) from @itwin/core-frontend
  AccuDrawHintBuilder,
  AccuSnap,
  ActivityMessageDetails,
  AuxCoordSystem2dState,
  AuxCoordSystem3dState,
  AuxCoordSystemSpatialState,
  AuxCoordSystemState,
  BeButtonEvent,
  BeButtonState,
  BeTouchEvent,
  BeWheelEvent,
  BingElevationProvider,
  BingLocationProvider,
  CategorySelectorState,
  ChangeFlags,
  Cluster,
  ContextRealityModelState,
  DecorateContext,
  Decorations,
  DisclosedTileTreeSet,
  DisplayStyle2dState,
  DisplayStyle3dState,
  DisplayStyleState,
  DrawingModelState,
  DrawingViewState,
  EditManipulator,
  ElementLocateManager,
  ElementPicker,
  ElementState,
  EmphasizeElements,
  EntityState,
  EventController,
  FeatureSymbology,
  FlashSettings,
  FrustumAnimator,
  GeometricModel2dState,
  GeometricModel3dState,
  GeometricModelState,
  GlobeAnimator,
  GraphicBranch,
  GraphicBuilder,
  HiliteSet,
  HitDetail,
  HitList,
  IModelConnection,
  IconSprites,
  InputCollector,
  InteractiveTool,
  IntersectDetail,
  LocateOptions,
  LocateResponse,
  MarginPercent,
  Marker,
  MarkerSet,
  ModelSelectorState,
  ModelState,
  NotificationHandler,
  NotificationManager,
  NotifyMessageDetails,
  OffScreenViewport,
  OrthographicViewState,
  PerModelCategoryVisibility,
  PhysicalModelState,
  Pixel,
  PrimitiveTool,
  RenderClipVolume,
  RenderContext,
  RenderGraphic,
  RenderGraphicOwner,
  RenderSystem,
  Scene,
  ScreenViewport,
  SectionDrawingModelState,
  SelectionSet,
  SheetModelState,
  SheetViewState,
  SnapDetail,
  SpatialLocationModelState,
  SpatialModelState,
  SpatialViewState,
  Sprite,
  SpriteLocation,
  TentativePoint,
  Tile,
  TileAdmin,
  TileDrawArgs,
  TileRequest,
  TileRequestChannel,
  TileRequestChannelStatistics,
  TileRequestChannels,
  TileTree,
  TileTreeReference,
  TileUsageMarker,
  Tiles,
  Tool,
  ToolAdmin,
  ToolAssistance,
  ToolSettings,
  TwoWayViewportFrustumSync,
  TwoWayViewportSync,
  ViewClipClearTool,
  ViewClipDecoration,
  ViewClipDecorationProvider,
  ViewClipTool,
  ViewCreator2d,
  ViewCreator3d,
  ViewManager,
  ViewManip,
  ViewPose,
  ViewPose2d,
  ViewPose3d,
  ViewRect,
  ViewState,
  ViewState2d,
  ViewState3d,
  ViewTool,
  ViewingSpace,
  Viewport,
  canvasToImageBuffer,
  canvasToResizedCanvasWithBars,
  connectViewportFrusta,
  connectViewportViews,
  connectViewports,
  extractImageSourceDimensions,
  getCompressedJpegFromCanvas,
  getImageSourceFormatForMimeType,
  getImageSourceMimeType,
  imageBufferToBase64EncodedPng,
  imageBufferToCanvas,
  imageBufferToPngDataUrl,
  imageElementFromImageSource,
  imageElementFromUrl,
  queryTerrainElevationOffset,
  readElementGraphics,
  readGltfGraphics,
  synchronizeViewportFrusta,
  synchronizeViewportViews,
} from "../core-frontend";

import {
  // @public enum(s) from @itwin/core-common
  BackgroundFill,
  BackgroundMapType,
  BatchType,
  BisCodeSpec,
  BriefcaseIdValue,
  ChangeOpCode,
  ChangedValueState,
  ChangesetType,
  CommonLoggerCategory,
  ECSqlSystemProperty,
  ECSqlValueType,
  ElementGeometryOpcode,
  FeatureOverrideType,
  FillDisplay,
  FillFlags,
  FontType,
  GeoCoordStatus,
  GeometryClass,
  GeometryStreamFlags,
  GeometrySummaryVerbosity,
  GlobeMode,
  GridOrientationType,
  HSVConstants,
  ImageBufferFormat,
  ImageSourceFormat,
  LinePixels,
  MassPropertiesOperation,
  MonochromeMode,
  Npc,
  PlanarClipMaskMode,
  PlanarClipMaskPriority,
  QueryRowFormat,
  Rank,
  RenderMode,
  SectionType,
  SkyBoxImageType,
  SpatialClassifierInsideDisplay,
  SpatialClassifierOutsideDisplay,
  SyncMode,
  TerrainHeightOriginMode,
  TextureMapUnits,
  ThematicDisplayMode,
  ThematicGradientColorScheme,
  ThematicGradientMode,
  TxnAction,
  TypeOfChange,
  // @public real(s) from @itwin/core-common
  ColorByName,
  ColorDef,
  FrustumPlanes,
  QParams2d,
  QParams3d,
  QPoint2d,
  QPoint2dBuffer,
  QPoint2dBufferBuilder,
  QPoint2dList,
  QPoint3d,
  QPoint3dBuffer,
  QPoint3dBufferBuilder,
  QPoint3dList,
  Quantization,
} from "@itwin/core-common";

const extensionExports = {
  ACSDisplayOptions,
  ACSType,
  AccuDrawHintBuilder,
  AccuSnap,
  ActivityMessageDetails,
  ActivityMessageEndReason,
  AuxCoordSystem2dState,
  AuxCoordSystem3dState,
  AuxCoordSystemSpatialState,
  AuxCoordSystemState,
  BackgroundFill,
  BackgroundMapType,
  BatchType,
  BeButton,
  BeButtonEvent,
  BeButtonState,
  BeModifierKeys,
  BeTouchEvent,
  BeWheelEvent,
  BingElevationProvider,
  BingLocationProvider,
  BisCodeSpec,
  BriefcaseIdValue,
  CategorySelectorState,
  ChangeFlags,
  ChangeOpCode,
  ChangedValueState,
  ChangesetType,
  ClipEventType,
  Cluster,
  ColorByName,
  ColorDef,
  CommonLoggerCategory,
  ContextRealityModelState,
  ContextRotationId,
  CoordSource,
  CoordSystem,
  CoordinateLockOverrides,
  DecorateContext,
  Decorations,
  DisclosedTileTreeSet,
  DisplayStyle2dState,
  DisplayStyle3dState,
  DisplayStyleState,
  DrawingModelState,
  DrawingViewState,
  ECSqlSystemProperty,
  ECSqlValueType,
  EditManipulator,
  ElementGeometryOpcode,
  ElementLocateManager,
  ElementPicker,
  ElementState,
  EmphasizeElements,
  EntityState,
  EventController,
  EventHandled,
  FeatureOverrideType,
  FeatureSymbology,
  FillDisplay,
  FillFlags,
  FlashMode,
  FlashSettings,
  FontType,
  FrontendLoggerCategory,
  FrustumAnimator,
  FrustumPlanes,
  GeoCoordStatus,
  GeometricModel2dState,
  GeometricModel3dState,
  GeometricModelState,
  GeometryClass,
  GeometryStreamFlags,
  GeometrySummaryVerbosity,
  GlobeAnimator,
  GlobeMode,
  GraphicBranch,
  GraphicBuilder,
  GraphicType,
  GridOrientationType,
  HSVConstants,
  HiliteSet,
  HitDetail,
  HitDetailType,
  HitGeomType,
  HitList,
  HitParentGeomType,
  HitPriority,
  HitSource,
  IModelConnection,
  IconSprites,
  ImageBufferFormat,
  ImageSourceFormat,
  InputCollector,
  InputSource,
  InteractiveTool,
  IntersectDetail,
  KeyinParseError,
  LinePixels,
  LocateAction,
  LocateFilterStatus,
  LocateOptions,
  LocateResponse,
  ManipulatorToolEvent,
  MarginPercent,
  Marker,
  MarkerSet,
  MassPropertiesOperation,
  MessageBoxIconType,
  MessageBoxType,
  MessageBoxValue,
  ModelSelectorState,
  ModelState,
  MonochromeMode,
  NotificationHandler,
  NotificationManager,
  NotifyMessageDetails,
  Npc,
  OffScreenViewport,
  OrthographicViewState,
  OutputMessageAlert,
  OutputMessagePriority,
  OutputMessageType,
  ParseAndRunResult,
  PerModelCategoryVisibility,
  PhysicalModelState,
  Pixel,
  PlanarClipMaskMode,
  PlanarClipMaskPriority,
  PrimitiveTool,
  QParams2d,
  QParams3d,
  QPoint2d,
  QPoint2dBuffer,
  QPoint2dBufferBuilder,
  QPoint2dList,
  QPoint3d,
  QPoint3dBuffer,
  QPoint3dBufferBuilder,
  QPoint3dList,
  Quantization,
  QueryRowFormat,
  Rank,
  RenderClipVolume,
  RenderContext,
  RenderGraphic,
  RenderGraphicOwner,
  RenderMode,
  RenderSystem,
  Scene,
  ScreenViewport,
  SectionDrawingModelState,
  SectionType,
  SelectionMethod,
  SelectionMode,
  SelectionProcessing,
  SelectionSet,
  SelectionSetEventType,
  SheetModelState,
  SheetViewState,
  SkyBoxImageType,
  SnapDetail,
  SnapHeat,
  SnapMode,
  SnapStatus,
  SpatialClassifierInsideDisplay,
  SpatialClassifierOutsideDisplay,
  SpatialLocationModelState,
  SpatialModelState,
  SpatialViewState,
  Sprite,
  SpriteLocation,
  StandardViewId,
  StartOrResume,
  SyncMode,
  TentativePoint,
  TerrainHeightOriginMode,
  TextureMapUnits,
  ThematicDisplayMode,
  ThematicGradientColorScheme,
  ThematicGradientMode,
  Tile,
  TileAdmin,
  TileBoundingBoxes,
  TileDrawArgs,
  TileGraphicType,
  TileLoadPriority,
  TileLoadStatus,
  TileRequest,
  TileRequestChannel,
  TileRequestChannelStatistics,
  TileRequestChannels,
  TileTree,
  TileTreeLoadStatus,
  TileTreeReference,
  TileUsageMarker,
  TileVisibility,
  Tiles,
  Tool,
  ToolAdmin,
  ToolAssistance,
  ToolAssistanceImage,
  ToolAssistanceInputMethod,
  ToolSettings,
  TwoWayViewportFrustumSync,
  TwoWayViewportSync,
  TxnAction,
  TypeOfChange,
  UniformType,
  VaryingType,
  ViewClipClearTool,
  ViewClipDecoration,
  ViewClipDecorationProvider,
  ViewClipTool,
  ViewCreator2d,
  ViewCreator3d,
  ViewManager,
  ViewManip,
  ViewPose,
  ViewPose2d,
  ViewPose3d,
  ViewRect,
  ViewState,
  ViewState2d,
  ViewState3d,
  ViewStatus,
  ViewTool,
  ViewingSpace,
  Viewport,
  canvasToImageBuffer,
  canvasToResizedCanvasWithBars,
  connectViewportFrusta,
  connectViewportViews,
  connectViewports,
  extractImageSourceDimensions,
  getCompressedJpegFromCanvas,
  getImageSourceFormatForMimeType,
  getImageSourceMimeType,
  imageBufferToBase64EncodedPng,
  imageBufferToCanvas,
  imageBufferToPngDataUrl,
  imageElementFromImageSource,
  imageElementFromUrl,
  queryTerrainElevationOffset,
  readElementGraphics,
  readGltfGraphics,
  synchronizeViewportFrusta,
  synchronizeViewportViews,
};

// END GENERATED CODE

const getExtensionApi = (id: string) => {
  return {
    exports: {
      // exceptions
      ExtensionHost,
      // automated
      ...extensionExports,
    },
    api: new ExtensionImpl(id),
  };
};

(globalThis as any)[globalSymbol] = {
  getExtensionApi,
};
