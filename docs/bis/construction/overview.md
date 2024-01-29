# Construction Management

## Overview

Supported workflows:

- Project breakdown into the construction work areas;
- Construction modeling - splitting up design data into smaller pieces suitable for construction;
- Classification - cost codes assignment to the constructible components;
- Quantity Takeoff - work steps quantities calculation.

## Project breakdown into construction work areas

Construction work areas are used throughout the entire construction project lifecycle: estimation, planning and sequencing, progress reporting and tracking. By breaking a project down into construction work areas some design elements may cross work area boundaries and as a result such elements are split into multiple pieces.

![Asset](../media/WorkAreaSplit.png)

*Picture 1. Project breakdown into construction work areas*

A portion of a design element that got split because it crossed the construction work area boundary is modeled as `WorkAreaDetailingElement` (Portion 'X' and Portion 'Y' in the example above). This element may or may not be suitable for construction. In cases when engineer decides that it is too big or requires different means and methods assigned, then it will be split further during construction modeling step.

## Construction modeling

During construction modeling step some design elements are split into smaller pieces suitable for construction. Such a sliced portion of a real-world object is modeled as `ConstructionDetailingElement` (Portion 'X1', Portion 'X2', Portion 'S' and Portion 'Z' in the example below).

![Asset](../media/ConstructionModelingSplit.png)

*Picture 2. Construction modeling sample*

Note, that `ConstructionDetailingElement` does not cross the boundaries of `WorkAreaDetailingElement`.

If a real-world physical object crosses multiple construction work areas and different means and methods need to be assigned to its different parts (for example, bottom and top) then separate `ConstructionDetailingElement` instances representing each part will be created in each construction work area:

![Asset](../media/ConstructionModelingSplitTopBottom.png)

*Picture 3. Construction modeling*

## Relevant Standard Schemas

| Schema | Purpose |
| --- | --- |
| [BisCore](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=BisCore) | Foundational concepts & patterns for all BIS schemas |
| [Construction](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=Construction) | Main concrete concepts used in Construction modeling |
| [PhysicalMaterial](https://imodelschemaeditor.bentley.com/?stage=browse&elementtype=schema&id=PhysicalMaterial) | Common definitions of materials used in AEC industries |
