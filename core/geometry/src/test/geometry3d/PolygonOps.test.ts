/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { expect } from "chai";
import { GeometryQuery } from "../../curve/GeometryQuery";
import { LineSegment3d } from "../../curve/LineSegment3d";
import { LineString3d } from "../../curve/LineString3d";
import { Loop } from "../../curve/Loop";
import { ParityRegion } from "../../curve/ParityRegion";
import { RegionOps } from "../../curve/RegionOps";
import { UnionRegion } from "../../curve/UnionRegion";
import { Geometry } from "../../Geometry";
import { GrowableXYZArray } from "../../geometry3d/GrowableXYZArray";
import { Matrix3d } from "../../geometry3d/Matrix3d";
import { Point3dArrayCarrier } from "../../geometry3d/Point3dArrayCarrier";
import { Point3d, Vector3d } from "../../geometry3d/Point3dVector3d";
import { PolygonOps } from "../../geometry3d/PolygonOps";
import { Range2d, Range3d } from "../../geometry3d/Range";
import { Ray3d } from "../../geometry3d/Ray3d";
import { SortablePolygon } from "../../geometry3d/SortablePolygon";
import { Transform } from "../../geometry3d/Transform";
import { Sample } from "../../serialization/GeometrySamples";
import { Checker } from "../Checker";
import { GeometryCoreTestIO } from "../GeometryCoreTestIO";

function makeLoop(range: Range2d, close: boolean, ySign: number = 1): GrowableXYZArray {
  const loop = new GrowableXYZArray();
  loop.pushXYZ(range.low.x, range.low.y * ySign, 0);
  loop.pushXYZ(range.high.x, range.low.y * ySign, 0);
  loop.pushXYZ(range.high.x, range.high.y * ySign, 0);
  loop.pushXYZ(range.low.x, range.high.y * ySign, 0);
  if (close) loop.pushXYZ(range.low.x, range.low.y * ySign, 0);
  return loop;
}

describe("PolygonOps", () => {
  it("SortOuterAndHoleLoopsXY.DeepNest", () => {
    const ck = new Checker();
    const a = 5.0;
    const b = 2.0 * a;
    const range1 = Range2d.createXYXY(0, 0, a, a);
    const allGeometry: GeometryQuery[] = [];
    let x0 = 0.0;
    for (const holeYFraction of [0, 1]) {
      const loops: GrowableXYZArray[] = [];
      for (let i = 0; i < 4; i++) {
        let y0 = 0.0;
        loops.push(makeLoop(range1, true));
        // reduce size for next pass . ..
        range1.scaleAboutCenterInPlace(0.9);
        range1.low.y = holeYFraction * range1.low.y;
        GeometryCoreTestIO.captureGeometry(allGeometry, LineString3d.createArrayOfLineString3d(loops), x0, y0);
        y0 += b;
        const outputPolygons = PolygonOps.sortOuterAndHoleLoopsXY(loops);
        const outputRegions = RegionOps.sortOuterAndHoleLoopsXY(loops);
        for (const region of outputPolygons) {
          GeometryCoreTestIO.captureGeometry(allGeometry, LineString3d.createArrayOfLineString3d(region), x0, y0);
          y0 += b;
        }
        if (outputRegions !== undefined) {
          GeometryCoreTestIO.captureGeometry(allGeometry, LineSegment3d.createXYXY(0, -0.1 * b, 0.9 * b, 0), x0, y0);
          if (outputRegions instanceof UnionRegion) {
            ck.testExactNumber(
              outputRegions.children.length,
              outputPolygons.length,
              "hole sort as region versus polygons"
            );
            for (const child of outputRegions.children) {
              GeometryCoreTestIO.captureGeometry(allGeometry, child, x0, y0);
            }
          } else {
            ck.testExactNumber(1, outputPolygons.length, "hole sort as region versus polygons");
            GeometryCoreTestIO.captureGeometry(allGeometry, outputRegions, x0, y0);
          }
        }
        x0 += b;
      }
      x0 += b;
    }
    GeometryCoreTestIO.saveGeometry(allGeometry, "PolygonOps", "SortOuterAndHoleLoopsXY.DeepNest");
    expect(ck.getNumErrors()).equals(0);
  });

  it("SortOuterAndHoleLoopsXY.DeepAbuttingNest", () => {
    const ck = new Checker();
    const a = 5.0;
    const b = 2.0 * a;
    const range1 = Range2d.createXYXY(0, 0, a, a);
    const allGeometry: GeometryQuery[] = [];
    let x0 = 0.0;
    for (const holeYFraction of [0.0]) {
      const loops: GrowableXYZArray[] = [];
      let layoutSign = 1.0;
      for (let i = 0; i < 4; i++) {
        let y0 = 0.0;
        loops.push(makeLoop(range1, true, layoutSign));
        layoutSign *= -1.0;
        // reduce size for next pass . ..
        range1.scaleAboutCenterInPlace(0.9);
        range1.low.y = holeYFraction * range1.low.y;
        GeometryCoreTestIO.captureGeometry(allGeometry, LineString3d.createArrayOfLineString3d(loops), x0, y0);
        y0 += b;
        const outputPolygons = PolygonOps.sortOuterAndHoleLoopsXY(loops);
        const outputRegions = RegionOps.sortOuterAndHoleLoopsXY(loops);
        for (const region of outputPolygons) {
          GeometryCoreTestIO.captureGeometry(allGeometry, LineString3d.createArrayOfLineString3d(region), x0, y0);
          y0 += b;
        }
        if (outputRegions !== undefined) {
          GeometryCoreTestIO.captureGeometry(allGeometry, LineSegment3d.createXYXY(0, -0.1 * b, 0.9 * b, 0), x0, y0);
          if (outputRegions instanceof UnionRegion) {
            ck.testExactNumber(
              outputRegions.children.length,
              outputPolygons.length,
              "hole sort as region versus polygons"
            );
            for (const child of outputRegions.children) {
              GeometryCoreTestIO.captureGeometry(allGeometry, child, x0, y0);
            }
          } else {
            ck.testExactNumber(1, outputPolygons.length, "hole sort as region versus polygons");
            GeometryCoreTestIO.captureGeometry(allGeometry, outputRegions, x0, y0);
          }
        }
        x0 += 2.0 * b;
      }
      x0 += 2.0 * b;
    }
    GeometryCoreTestIO.saveGeometry(allGeometry, "PolygonOps", "SortOuterAndHoleLoopsXY.DeepAbuttingNest");
    expect(ck.getNumErrors()).equals(0);
  });

  it("SortOuterAndHoleLoopsXY.ManyHoles", () => {
    const ck = new Checker();
    const a = 5.0;
    const b = 2.0 * a;
    let x0 = 0.0;
    const allGeometry: GeometryQuery[] = [];
    for (const numHole of [0, 1, 3, 13]) {
      GeometryCoreTestIO.consoleLog({ numHoles: numHole });
      const range1 = Range2d.createXYXY(0, 0, numHole * a, a);
      const loops: GrowableXYZArray[] = [];
      loops.push(makeLoop(range1, true));
      for (let i = 0; i < numHole; i++) {
        // Place holes along the range.
        const xx = i * a;
        // Even numbered interior boxes go "above", odds stay inside.
        const yy = (i & 0x01) === 0 ? a : 0;
        const holeRange = Range2d.createXYXY(xx, yy, xx + a, yy + a);
        holeRange.scaleAboutCenterInPlace(0.9);
        loops.push(makeLoop(holeRange, true));
        const numHoleA = i % 3;
        for (let k = 0; k < numHoleA; k++) {
          holeRange.scaleAboutCenterInPlace(0.8);
          loops.push(makeLoop(holeRange, true));
        }
      }
      let y0 = 0.0;
      GeometryCoreTestIO.captureCloneGeometry(allGeometry, LineString3d.createArrayOfLineString3d(loops), x0, y0);
      y0 += 1.5 * b;
      const outputPolygons = PolygonOps.sortOuterAndHoleLoopsXY(loops);
      const outputRegions = RegionOps.sortOuterAndHoleLoopsXY(loops);
      for (const polygon of outputPolygons) {
        // GeometryCoreTestIO.captureGeometry(allGeometry, LineSegment3d.createXYXY(-0.5 * a, 0, (numHole + 0.5) * a, 0), x0, y0);
        // GeometryCoreTestIO.captureCloneGeometry(allGeometry, LineString3d.createArrayOfLineString3d(region), x0, y0);
        if (polygon.length > 1) {
          const parityLoops = [];
          for (const loopA of polygon) parityLoops.push(Loop.create(LineString3d.create(loopA)));
          const parityRegion = ParityRegion.createLoops(parityLoops);
          GeometryCoreTestIO.captureCloneGeometry(allGeometry, parityRegion, x0, y0);
        } else {
          GeometryCoreTestIO.captureGeometry(allGeometry, Loop.create(LineString3d.create(polygon[0])), x0, y0);
        }
      }
      y0 += 2.0 * b;
      GeometryCoreTestIO.captureGeometry(allGeometry, outputRegions, x0, y0);
      x0 += (numHole + 2) * a;
    }
    GeometryCoreTestIO.saveGeometry(allGeometry, "PolygonOps", "SortOuterAndHoleLoopsXY.ManyHoles");
    expect(ck.getNumErrors()).equals(0);
  });

  it("SortablePolygon.LoopToPolygon", () => {
    const ck = new Checker();
    let x0 = 0.0;
    const y0 = 0.0;
    const allGeometry: GeometryQuery[] = [];
    GeometryCoreTestIO.saveGeometry(allGeometry, "PolygonOps", "SortOuterAndHoleLoopsXY.ManyHoles");
    const loops = Sample.createSimpleLoops();
    for (const loop of loops) {
      const range = loop.range();
      const sortablePolygon = new SortablePolygon(loop, range);
      GeometryCoreTestIO.captureCloneGeometry(allGeometry, loop, x0, y0);
      const dy = 2.0 * range.yLength();
      sortablePolygon.reverseForAreaSign(1.0);
      GeometryCoreTestIO.captureCloneGeometry(allGeometry, sortablePolygon.grabLoop(), x0, y0 + dy);
      const polygonA = sortablePolygon.grabPolygon()!;
      GeometryCoreTestIO.captureCloneGeometry(allGeometry, Loop.createPolygon(polygonA), x0, y0 + 2 * dy);
      ck.testTrue(PolygonOps.areaXY(polygonA) > 0);

      sortablePolygon.reverseForAreaSign(-2.0);
      const polygonB = sortablePolygon.grabPolygon()!;
      GeometryCoreTestIO.captureCloneGeometry(allGeometry, sortablePolygon.grabLoop(), x0, y0 + 4.0 * dy);
      GeometryCoreTestIO.captureCloneGeometry(
        allGeometry,
        Loop.createPolygon(sortablePolygon.grabPolygon()!),
        x0,
        y0 + 5 * dy
      );
      ck.testTrue(PolygonOps.areaXY(polygonB) < 0);

      x0 += 2.0 * range.xLength();
    }
    // verify that degenerate loops fail some things . ..
    const degeneratePoints = GrowableXYZArray.create([
      [0, 0],
      [1, 0],
    ]);
    const range2 = degeneratePoints.getRange();
    const degenerateA = new SortablePolygon(degeneratePoints.clone(), range2);
    const degenerateB = new SortablePolygon(Loop.createPolygon(degeneratePoints), range2);
    ck.testUndefined(degenerateA.getAnyInteriorPoint());
    ck.testUndefined(degenerateB.getAnyInteriorPoint());
    GeometryCoreTestIO.saveGeometry(allGeometry, "SortablePolygon", "LoopToPolygon");
    expect(ck.getNumErrors()).equals(0);
  });

  function testPolygonRayIntersection(ck: Checker, allGeometry: GeometryQuery[], polygon: Point3d[], x0?: number) {
    // create grid of test rays with known polygon plane intersections
    const range = Range3d.create(...polygon);
    range.expandInPlace(1.0);
    const testPts: Point3d[] = [];
    const testSegments: LineSegment3d[] = [];
    const delta = 0.1;
    const deltaV = Vector3d.createNormalized(1, -1, -5)!;
    for (let xCoord = range.low.x; xCoord < range.high.x; xCoord += delta) {
      for (let yCoord = range.low.y; yCoord < range.high.y; yCoord += delta) {
        const testPt = Point3d.create(xCoord, yCoord);
        testPts.push(testPt);
        const startPt = Point3d.createAdd2Scaled(testPt, 1.0, deltaV, -Geometry.hypotenuseSquaredXY(xCoord, yCoord));
        const endPt = Point3d.createAdd2Scaled(startPt, 1.0, deltaV, 1.0); // segment parameter is arc length
        testSegments.push(LineSegment3d.create(startPt, endPt));
      }
    }

    // rotate geometry out of xy-plane
    const normal = Vector3d.createNormalized(1, -2, -3)!;
    const localToWorld = Matrix3d.createRigidHeadsUp(normal);
    localToWorld.multiplyVectorArrayInPlace(polygon);
    localToWorld.multiplyVectorArrayInPlace(testPts);
    const localToWorldTransform = Transform.createOriginAndMatrix(undefined, localToWorld);
    for (const seg of testSegments) seg.tryTransformInPlace(localToWorldTransform);

    const polygonCarrier = new Point3dArrayCarrier(polygon);
    GeometryCoreTestIO.captureCloneGeometry(allGeometry, LineString3d.create(polygon), x0);
    const isConvex = PolygonOps.isConvex(polygon);
    const xyz = Point3d.createZero();

    for (let i = 0; i < testPts.length; ++i) {
      const loc = PolygonOps.intersectSegment(polygon, testSegments[i].point0Ref, testSegments[i].point1Ref);
      if (ck.testTrue(loc.isValid, "found ray intersection")) {
        ck.testPoint3d(testPts[i], loc.point, "intersection point as expected");
        ck.testCoordinate(
          testPts[i].distance(testSegments[i].point0Ref),
          loc.a,
          "intersection parameter along ray as expected"
        );
        if (
          ck.testTrue(
            loc.closestEdgeIndex >= 0 &&
              loc.closestEdgeIndex < polygon.length &&
              loc.closestEdgeParam >= 0.0 &&
              loc.closestEdgeParam <= 1.0,
            "found edge projection"
          )
        ) {
          const projPt = polygonCarrier.interpolateIndexIndex(
            loc.closestEdgeIndex,
            loc.closestEdgeParam,
            (loc.closestEdgeIndex + 1) % polygon.length
          )!;
          GeometryCoreTestIO.captureCloneGeometry(allGeometry, LineString3d.create([testPts[i], projPt]), x0);
        }
        if (isConvex) {
          const b = PolygonOps.convexBarycentricCoordinates(polygon, testPts[i]);
          ck.testBoolean(loc.isInsideOrOn, undefined !== b, "barycentric coords exist iff point inside convex polygon");
          if (undefined !== b) {
            ck.testExactNumber(b.length, polygon.length, "barycentric coordinate length matches polygon length");
            polygonCarrier.linearCombination(b, xyz);
            ck.testPoint3d(xyz, testPts[i], "barycentric roundtrip");
            let coordSum = 0.0;
            let num01 = 0;
            for (const coord of b) {
              if (coord >= 0.0 && coord <= 1.0) ++num01;
              coordSum += coord;
            }
            ck.testCoordinateWithToleranceFactor(
              1.0,
              coordSum,
              Geometry.smallMetricDistance,
              "barycentric coords sum to 1"
            );
            ck.testExactNumber(num01, b.length, "testPt insideOn => all barycentric coords in [0,1]");
          }
        }
      }
    }
  }

  it("intersectRay3d", () => {
    const ck = new Checker();
    const allGeometry: GeometryQuery[] = [];
    const xDelta = 5;

    const convexPolygon = [
      Point3d.create(-2, -1),
      Point3d.create(-2, 0),
      Point3d.create(-2, 1),
      Point3d.create(-1, 2),
      Point3d.create(0, 2),
      Point3d.create(1, 2),
      Point3d.create(2, 2),
      Point3d.create(1, -1),
      Point3d.create(0, -2),
    ];
    convexPolygon.push(convexPolygon[0].clone()); // closure point for coverage and display
    testPolygonRayIntersection(ck, allGeometry, convexPolygon);

    const convexPolygonWithDegenerateEdges = [
      Point3d.create(-2, -1),
      Point3d.create(-2, -1),
      Point3d.create(-2, 0),
      Point3d.create(-2, 0),
      Point3d.create(-2, 1),
      Point3d.create(-1, 2),
      Point3d.create(0, 2),
      Point3d.create(2, 2),
      Point3d.create(1, -1),
      Point3d.create(0, -2),
    ];
    testPolygonRayIntersection(ck, allGeometry, convexPolygonWithDegenerateEdges);

    const nonConvexPolygon = [
      Point3d.create(-2, -1),
      Point3d.create(-2, 0),
      Point3d.create(-2, 1),
      Point3d.create(-1, 2),
      Point3d.create(0, 2),
      Point3d.create(2, 2),
      Point3d.create(1, 1),
      Point3d.create(1, -1),
      Point3d.create(0, -2),
      Point3d.create(-1, 0),
    ];
    testPolygonRayIntersection(ck, allGeometry, nonConvexPolygon, xDelta);

    const degeneratePolygon = [Point3d.create(-2, -1), Point3d.create(-2, 0), Point3d.create(-2, 1)];
    const ray = Ray3d.create(Point3d.create(0, 0, 5), Vector3d.create(0, 0, -1));
    ck.testUndefined(PolygonOps.convexBarycentricCoordinates(degeneratePolygon, Point3d.createZero()));
    ck.testFalse(
      PolygonOps.intersectRay3d(degeneratePolygon, ray).isValid,
      "degenerate polygon intersection is invalid"
    );

    const triangle = [Point3d.create(-2, -1), Point3d.create(0, 2), Point3d.create(1, 0)];
    const parallelRay = Ray3d.create(Point3d.create(0, 0, 5), Vector3d.create(1, 1));
    ck.testFalse(PolygonOps.intersectRay3d(triangle, parallelRay).isValid, "parallel ray intersection is invalid");

    GeometryCoreTestIO.saveGeometry(allGeometry, "PolygonOps", "intersectRay3d");
    expect(ck.getNumErrors()).equals(0);
  });
});
