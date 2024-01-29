# Spatial Composition of Roads, Rail & Bridges

## Overview

In BIS, a Road, Rail and Bridge are modeled via [Spatial Composition](../data-organization/spatial-composition.md), thus, they are introduced as subclasses of [spcomp:Facility](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=entityclass&id=SpatialComposition.Facility). This approach allows for the organization of their more granular physical elements into a hierarchy driven by a spatial decomposition of such assets that makes the most sense for a particular BIS repository, without conflicting with other hierarchical ways of organizing the same more granular physical elements, such as [Physical Systems](../data-organization/modeling-systems.md) or the [Subject hierarchy](../data-organization/information-hierarchy.md).

Instances of any subclass of `spcomp:Facility` are decomposed into finer spatial parts, captured by the [spcomp:FacilityPart](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=entityclass&id=SpatialComposition.FacilityPart) abstract class, by associating them with the [spcomp:SpatialStructureElementAggregatesElements](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=relationshipclass&id=SpatialComposition.SpatialStructureElementAggregatesElements) relationship.

## Spatial Composition & Bridges

### Bridge Parts

The `BridgeSpatial` BIS schema contains classes covering the most commonly referred parts of a Bridge. They include:

- Superstructure
  - Deck
- Substructure
  - Abutment
  - Pier

### Organizing Physical elements on a Bridge's Spatial Composition hierarchy

All physical Elements in a Bridge shall be organized according to the Spatial Composition hierarchy adopted for it. Since an Element can only be *held* by one and only one `brsp:BridgePart` instance on it, elements shall be assigned to the top-most part in the Bridge's Spatial Composition hierarchy that completely contains it.

The following table depicts a typical organization of common Physical Elements used in a Bridge with respect to its Spatial Composition parts.

| Physical Element | Bridge Part |
| --- | --- |
| `brphys:Bearing` | `brsp:Superstructure` |
| `sp:Beam` | `brsp:Superstructure` |
| `cvphys:Course` | `brsp:Deck` |
| `sp:Slab` | `brsp:Deck` |
| `sp:Wall` <assembled by `brphys:WingWall`> | `brsp:Abutment` |
| `sp:Column` (assembled by `brphys:Pier`) | `brsp:Pier` |
| `sp:Footing` (assembled by `brphys:Pier`) | `brsp:Pier` or `brsp:Abutment` |

## Spatial Composition & Roads

### Road Parts

The `RoadSpatial` BIS schema contains classes covering the most commonly referred parts of a Road. They include:

- RoadwayPlateau
  - Roadway
    - TrafficLane
  - Shoulder
  - CentralReserve
    - CentralReservePart
- RoadSide
  - RoadSidePart
- Sidewalk
- Intersection

### Intersections

Instances of `rdsp:Intersection` represent common junctions between two or more Roads, leading to a graph (network) topology. Therefore, their handling in a purely hierarchical data organization such as a `Spatial Composition` tree requires an additional clarification.

The `rdsp:Intersection` class is introduced as a subclass of a `spcomp:FacilityPart`, thus, an instance of its class is expected to be aggregated directly or indirectly by only one instance of `rdsp:Road`. Other `rdsp:Road` instances are expected to refer to a crossing `rdsp:Intersection` instance via the `rdsp:RoadIncludesJunctions` relationship instead.

### Organizing Physical elements on a Road's Spatial Composition hierarchy

All physical Elements in a Road shall be organized according to the Spatial Composition hierarchy adopted for it. Since an Element can only be *held* by one and only one `rdsp:RoadPart` instance on it, elements shall be assigned to the top-most part in the Road's Spatial Composition hierarchy that completely contains it.

The following table depicts a typical organization of common Physical Elements used in a Road with respect to its Spatial Composition parts.

| Physical Element | Road Part |
| --- | --- |
| `cvphys:Course` | `rdsp:Roadway`, `rdsp:TrafficLane`, `rdsp:Intersection` or `rdsp:Sidewalk` |
| `cvphys:Curb` | `rdsp:Roadway` or `rdsp:Intersection` |
| `ew:SurfaceGrade` | `rdsp:RoadSide` or `rdsp:CentralReservePart` |

---
| Next: [Physical Systems in Roads, Rail & Bridges](./physical-systems.md)
|:---