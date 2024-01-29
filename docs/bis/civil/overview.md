# Roads, Rail & Bridges

## Overview

This section presents an introduction to the subset of standard BIS schemas that are relevant for BIS repositories that capture any Road, Rail and/or Bridge data. These schemas were designed extending [foundational](../intro/overview.md) and common concepts, rules and patterns defined at the Core and Common [BIS layers](../intro/bis-organization.md). These include:

- The concepts of a Road, Rail & Bridge [modeled physically](../physical-perspective/index.md) are introduced as subclasses of `spcomp:Facility`, according to BIS' [SpatialComposition](../data-organization/spatial-composition.md). See [Spatial Composition of Roads, Rail & Bridges](./spatial-composition.md) for more information.

- Systems providing specific functions, such as drainage or electrical, are modeled as subclasses of `dsys:DistributionSystem`, according to the patterns and rules defined by BIS' [Physical Systems](../data-organization/modeling-systems.md) and the `DistributionSystems` schema. See [Physical Systems in Roads, Rail & Bridges](./physical-systems.md) for more information.

- Instances modeling more granular `Physical` concepts such as `Course`, `Column` or `Pipe` can be optionally associated with their respectives `spcomp:ISpatialOrganizer` and `dsys:DistributionSystem`s depending upon their spatial organization and function that they target. Furthermore, Quantity Takeoffs can be calculated on them by following the standard BIS patterns for [Physical Materials](../physical-perspective/physical-materials.md) and [Quantities](../physical-perspective/qto-guidelines.md).

- Any instance of any kind can be linearly-referenced according to the rules and patterns defined by the `LinearReferencing` BIS schema. The `rralign:Alignment` class is the most common implementation of `lr:ILinearElement` for linearly-referenced Road, Rail & Bridge data. See [Linear Referencing](./linear-referencing.md) for more information.

- See [Structural Engineering in Bridges](./structural-engineering.md) for an introduction of topics related to the Structural domain applicable to Bridge data.

- See [Drawings & Sheets for Roads, Rail & Bridges](./drawings-sheets.md) for an introduction of the standard rules and patterns applicable to the storage of typical 2D deliverables in Road, Rail & Bridge projects in a BIS repository.

Lastly, the overall [BIS guide](../intro/overview.md) includes several additional articles that address many other fundamental BIS topics in detail.

## Relevant Standard Schemas

This section lists the most relevant standard BIS schemas in light of Road, Rail & Bridge data.

### Core & Common schemas

| Schema | Purpose |
| --- | --- |
| [Analytical](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=Analytical) | Base patterns followed by specialized analytical schemas |
| [BisCore](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=BisCore) | Foundational concepts & patterns for all BIS schemas |
| [DistributionSystems](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=DistributionSystems) | Base patterns used to describe the organization and connectivity of Systems distributing matter |
| [LinearReferencing](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=LinearReferencing) | Base patterns to locate data by using Linear Referencing |
| [PhysicalMaterial](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=PhysicalMaterial) | Common definitions of materials used in AEC industries |
| [SpatialComposition](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=SpatialComposition) | Base patterns used to describe the decomposition of Infrastructure Facilities into their parts |

### Structural Engineering schemas

| Schema | Purpose |
| --- | --- |
| [StructuralAnalysis](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=StructuralAnalysis) | Concepts used in Structural modeling |
| [StructuralMaterials](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=StructuralMaterials) | Properties of materials relevant for Structural modeling |
| [StructuralPhysical](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=StructuralPhysical) | Common Physical concepts used to describe Structural entities |

### Terrain, Subsurface & Earthwork schemas

| Schema | Purpose |
| --- | --- |
| [Earthwork](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=Earthwork) | Common concepts used while modeling earthwork activities |
| [GeologicalModel](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=GeologicalModel) | Analytical concepts used to describe the interpretation of a subterranean structure |
| [Terrain](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=Terrain) | Physical concepts providing *context* terrains |

### Road & Bridge specific schemas

| Schema | Purpose |
| --- | --- |
| [BridgePhysical](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=BridgePhysical) | Physical entities specific to Bridges |
| [BridgeSpatial](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=BridgeSpatial) | Concepts used to describe the spatial composition of a Bridge |
| [CivilPhysical](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=CivilPhysical) | Common Physical entities in Road, Rail, Site & Bridge |
| [RoadRailAlignment](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=RoadRailAlignment) | Concrete implementation of the Linear Referencing patterns in terms of Alignments, commonly used in linear projects |
| [RoadRailUnits](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=RoadRailUnits) | Kind of Quantities with typical formatting in Road, Rail & Bridge projects |
| [RoadSpatial](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=RoadSpatial) | Concepts used to describe the spatial composition of a Road |

---
| Next: [Spatial Composition of Roads, Rail & Bridges](./spatial-composition.md)
|:---