# Linear Referencing

## Overview

[ISO 19148:2021](https://www.iso.org/obp/ui/en/#iso:std:iso:19148:ed-2:v1:en) defines _Linear Referencing_ as the specification of a location relative to a linear element as a measurement along that element.

The [LinearReferencing schema](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=LinearReferencing) implements the main details of the conceptual model specified in the aforementioned ISO standard, enabling a canonical storage of Linearly Referenced Locations in BIS Repositories.

## Alignments as Linear Elements

Linear Referencing is widely used in Linear projects, being Roads, Rail and Bridges prime examples for them. In practice, engineers involved in the design and construction phases of the latter disciplines typically use _Alignments_ as the main construct for Linear Referencing purposes.

Following the same paradigm, BIS has the [Alignment](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=entityclass&id=RoadRailAlignment.Alignment) class based on the patterns and rules established by the `LinearReferencing` BIS schema, being the implementation of the [ILinearElement](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=mixin&id=LinearReferencing.ILinearElement) mix-in the most important.

As `ILinearElement`s, instances of `Alignment` can be used to linearly locate other elements. This is done via the [ILinearlyLocatedAlongILinearElement](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=relationshipclass&id=LinearReferencing.ILinearlyLocatedAlongILinearElement) relationship, which requires the located element to implement the [ILinearlyLocated](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=mixin&id=LinearReferencing.ILinearlyLocated) mix-in. Furthermore, measurements along _Linear Elements_ associated to `ILinearlyLocated` instances are captured by the appropriate subclass of the [LinearlyReferencedLocation](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=entityclass&id=LinearReferencing.LinearlyReferencedLocation) aspect.

It is also a common practice in Road, Rail and Bridge disciplines to specify location measurements with respect to well known locations along _Alignments_ typically referred to as _Stations_. BIS implements such practice via its [AlignmentStation](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=entityclass&id=RoadRailAlignment.AlignmentStation) class. Instances of `AlignmentStation` are then used to convert measurements stored in terms of the canonical Linear Referencing System in a BIS Repository into the one that should be for display and reporting purposes. An `Alignment` instance owns zero or more `AlignmentStation`s via the [AlignmentOwnsReferents](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=relationshipclass&id=RoadRailAlignment.AlignmentOwnsReferents) relationship.

---
| Next: [Structural Engineering in Bridges](./structural-engineering.md)
|:---