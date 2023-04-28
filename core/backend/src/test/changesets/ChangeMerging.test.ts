/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { assert } from "chai";
import * as path from "path";
import { Id64String, OpenMode } from "@itwin/core-bentley";
import { ChangesetFileProps, IModel, SubCategoryAppearance } from "@itwin/core-common";
import { DictionaryModel, Element, IModelDb, IModelJsFs, SpatialCategory, StandaloneDb } from "../../core-backend";
import { IModelTestUtils } from "../IModelTestUtils";
import { KnownTestLocations } from "../KnownTestLocations";

// Combine all local Txns and generate a changeset file. Then delete all local Txns.
function createChangeset(imodel: IModelDb): ChangesetFileProps {
  const changeset = imodel.nativeDb.startCreateChangeset();

  // completeCreateChangeset deletes the file that startCreateChangeSet created.
  // We make a copy of it now, before he does that.
  const csFileName = path.join(KnownTestLocations.outputDir, `${changeset.id}.changeset`);
  IModelJsFs.copySync(changeset.pathname, csFileName);
  changeset.pathname = csFileName;

  imodel.nativeDb.completeCreateChangeset({ index: 0 });
  return changeset;
}

function applyChangeSets(imodel: IModelDb, csHistory: ChangesetFileProps[], curIdx: number): number {
  while (curIdx < csHistory.length - 1) {
    ++curIdx;
    imodel.nativeDb.applyChangeset(csHistory[curIdx]);
  }
  return curIdx;
}

describe("ChangeMerging", () => {
  it("should merge changes so that two branches of an iModel converge", () => {
    // Make sure that the seed imodel has had all schema/profile upgrades applied, before we make copies of it.
    // (Otherwise, the upgrade Txn will appear to be in the changesets of the copies.)
    const testFileName = IModelTestUtils.prepareOutputFile("ChangeMerging", "upgraded.bim");
    const seedFileName = IModelTestUtils.resolveAssetFile("testImodel.bim");
    IModelJsFs.copySync(seedFileName, testFileName);
    const upgradedDb = StandaloneDb.openFile(testFileName, OpenMode.ReadWrite);
    createChangeset(upgradedDb);

    // Open copies of the seed file.
    const firstFileName = IModelTestUtils.prepareOutputFile("ChangeMerging", "first.bim");
    const secondFileName = IModelTestUtils.prepareOutputFile("ChangeMerging", "second.bim");
    const neutralFileName = IModelTestUtils.prepareOutputFile("ChangeMerging", "neutral.bim");
    IModelJsFs.copySync(testFileName, firstFileName);
    IModelJsFs.copySync(testFileName, secondFileName);
    IModelJsFs.copySync(testFileName, neutralFileName);
    const firstDb = StandaloneDb.openFile(firstFileName, OpenMode.ReadWrite);
    const secondDb = StandaloneDb.openFile(secondFileName, OpenMode.ReadWrite);
    const neutralDb = StandaloneDb.openFile(neutralFileName, OpenMode.ReadWrite);
    assert.isTrue(firstDb !== secondDb);
    firstDb.nativeDb.resetBriefcaseId(100);
    secondDb.nativeDb.resetBriefcaseId(200);
    neutralDb.nativeDb.resetBriefcaseId(300);

    const csHistory: ChangesetFileProps[] = [];

    let firstParent = -1;
    let secondParent = -1;
    let neutralParent = -1;

    let modelId: Id64String;
    let spatialCategoryId: Id64String;
    let el1: Id64String;
    // first. Create a new model, category, and element.  =>  #0
    if (true) {
      [, modelId] = IModelTestUtils.createAndInsertPhysicalPartitionAndModel(
        firstDb,
        IModelTestUtils.getUniqueModelCode(firstDb, "newPhysicalModel"),
        true
      );
      const dictionary: DictionaryModel = firstDb.models.getModel<DictionaryModel>(IModel.dictionaryId);
      const newCategoryCode = IModelTestUtils.getUniqueSpatialCategoryCode(dictionary, "ThisTestSpatialCategory");
      spatialCategoryId = SpatialCategory.insert(
        dictionary.iModel,
        dictionary.id,
        newCategoryCode.value,
        new SubCategoryAppearance({ color: 0xff0000 })
      );
      el1 = firstDb.elements.insertElement(
        IModelTestUtils.createPhysicalObject(firstDb, modelId, spatialCategoryId).toJSON()
      );
      firstDb.saveChanges();
      csHistory.push(createChangeset(firstDb));
      firstParent = csHistory.length - 1;
      assert.isTrue(csHistory.length - 1 === firstParent);
    }

    if (true) {
      // first -> second, neutral
      secondParent = applyChangeSets(secondDb, csHistory, secondParent);
      assert.isTrue(secondDb.models.getModel(modelId) !== undefined);
      assert.isTrue(secondDb.elements.getElement(spatialCategoryId) !== undefined);
      assert.isTrue(secondDb.elements.getElement(el1) !== undefined);

      neutralParent = applyChangeSets(neutralDb, csHistory, neutralParent);
      assert.isTrue(neutralDb.models.getModel(modelId) !== undefined);
      assert.isTrue(neutralDb.elements.getElement(spatialCategoryId) !== undefined);
      assert.isTrue(neutralDb.elements.getElement(el1) !== undefined);
    }

    // --- Test 1: Overlapping changes that really are conflicts => conflict-resolution policy is applied ---

    let expectedValueOfEl1UserLabel: string;

    // first: modify el1.userLabel
    if (true) {
      const el1cc = firstDb.elements.getElement(el1);
      expectedValueOfEl1UserLabel = el1cc.userLabel = `${el1cc.userLabel} -> changed by first`;
      firstDb.elements.updateElement(el1cc.toJSON());
      firstDb.saveChanges("first modified el1.userLabel");
      csHistory.push(createChangeset(firstDb));
      firstParent = csHistory.length - 1;
    }

    // second: modify el1.userLabel
    if (true) {
      const el1before: Element = secondDb.elements.getElement(el1);
      el1before.userLabel = `${el1before.userLabel} -> changed by first`;
      secondDb.elements.updateElement(el1before.toJSON());
      secondDb.saveChanges("second modified el1.userLabel");

      // merge => take second's change (RejectIncomingChange). That's because the default updateVsUpdate setting is RejectIncomingChange
      secondParent = applyChangeSets(secondDb, csHistory, secondParent);
      const el1after = secondDb.elements.getElement(el1);
      assert.equal(el1after.userLabel, expectedValueOfEl1UserLabel);
      csHistory.push(createChangeset(secondDb));
      secondParent = csHistory.length - 1; // eslint-disable-line @typescript-eslint/no-unused-vars
    }

    // Make sure a neutral observer sees secondUser's change.
    if (true) {
      neutralParent = applyChangeSets(neutralDb, csHistory, neutralParent); // eslint-disable-line @typescript-eslint/no-unused-vars
      const elobj = neutralDb.elements.getElement(el1);
      assert.equal(elobj.userLabel, expectedValueOfEl1UserLabel);
    }

    // firstUser: pull and see that secondUser has overridden my change
    if (true) {
      firstParent = applyChangeSets(firstDb, csHistory, firstParent);
      const elobj = firstDb.elements.getElement(el1);
      assert.equal(elobj.userLabel, expectedValueOfEl1UserLabel);
    }
  });
});
