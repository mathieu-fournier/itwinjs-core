/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Differencing
 */

import type { SchemaDifferences, SchemaType } from "./SchemaDifference";

/**
 * The unique conflicts codes for Schema differencing.
 *
 * To provide meaning to code values, with anticipation
 * of future rules for all current EC Types, the following
 * value ranges should be used:
 *
 * - Schema:                    000-099
 * - Class:                     100-199
 * - Constant:                  200-299
 * - CustomAttribute            300-399
 * - CustomAttributeClass:      400-499
 * - CustomAttributeContainer:  500-599
 * - EntityClass:               600-699
 * - Enumeration:               700-799
 * - Format:                    800-899
 * - InvertedUnit:              900-999
 * - KindOfQuantity:            1000-1099
 * - Mixin:                     1100-1199
 * - Phenomenon:                1200-1299
 * - Property:                  1300-1399
 * - PropertyCategory:          1400-1499
 * - RelationshipClass:         1500-1599
 * - RelationshipConstraint:    1600-1699
 * - StructClass:               1700-1799
 * - Unit:                      1800-1899
 * - UnitSystem:                1900-1999
 *
 * @alpha
 */
export enum ConflictCode {

  ConflictingItemName = "C-001",
  ConflictingReferenceAlias = "C-002",

  ConflictingBaseClass = "C-100",
  RemovingBaseClass = "C-101",
  SealedBaseClass = "C-102",

  ConflictingEnumerationType = "C-700",
  ConflictingEnumeratorValue = "C-701",

  MixinAppliedMustDeriveFromConstraint = "C-1100",

  ConflictingPropertyName = "C-1300",

  AbstractConstraintMustNarrowBaseConstraints = "C-1500",
  DerivedConstraintsMustNarrowBaseConstraints = "C-1501",
  ConstraintClassesDeriveFromAbstractConstraint = "C-1502",
}

interface SchemaDifferencesWithConflicts extends SchemaDifferences {
  readonly conflicts: SchemaDifferenceConflict[];
}

/**
 * Defines the interface for a conflict during Schema Differencing. Conflicts were discovered
 * while comparing the changed elements. Conflicts in the whole schema context are not found
 * on that level.
 *
 * @alpha
 */
export interface SchemaDifferenceConflict {
  /** A unique identifier of this conflict */
  readonly id: string;

  /**
   * The name of the schema type which is "Schema" for a conflict on the schema, on schema items
   * or objects that are related to schema items (properties, relationship constraints) it is the
   * name of the related schema item.
   */
  readonly schemaType: SchemaType;

  /** The name of the schema item the conflict appears on. */
  readonly itemName?: string;

  /** Optional path what on the item was conflicting. */
  readonly path?: string;

  /** The unique conflicting code. */
  readonly code: ConflictCode;

  /** A description of the conflict. */
  readonly description: string;

  /** The value in the source schema. */
  readonly source: unknown;

  /** The value in the target schema. */
  readonly target: unknown;
}

export function hasUnresolvedConflicts(differences: SchemaDifferences): differences is SchemaDifferencesWithConflicts {
  return getUnresolvedConflicts(differences).length > 0;
}

export function getUnresolvedConflicts(differences: SchemaDifferences): SchemaDifferenceConflict[] {
  if(differences.conflicts === undefined || differences.conflicts.length === 0) {
    return [];
  }

  const conflictMap = new Map<string, SchemaDifferenceConflict>();
  for(const conflict of differences.conflicts) {
    conflictMap.set(conflict.id, conflict);
  }

  if(differences.changes === undefined || differences.changes.length === 0) {
    return differences.conflicts;
  }

  for(const change of differences.changes) {
    const foundConflict = differences.conflicts.find((entry) => {
      return entry.itemName === change.itemName && entry.path === change.path;
    });

    if(foundConflict !== undefined) {
      conflictMap.delete(foundConflict.id);
    }
  }

  return [...conflictMap.values()];
}
