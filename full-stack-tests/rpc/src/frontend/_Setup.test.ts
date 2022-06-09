/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { executeBackendCallback } from "@itwin/certa/lib/utils/CallbackUtils";
import { Logger, LogLevel } from "@itwin/core-bentley";
import { BentleyCloudRpcConfiguration, BentleyCloudRpcManager, RpcConfiguration, WebAppRpcProtocol } from "@itwin/core-common";
import { ElectronApp } from "@itwin/core-electron/lib/cjs/ElectronFrontend";
import { MobileRpcManager } from "@itwin/core-mobile/lib/cjs/MobileFrontend";
import { BackendTestCallbacks } from "../common/SideChannels";
import { AttachedInterface, MobileTestInterface, MultipleClientsInterface, rpcInterfaces, TestRpcInterface } from "../common/TestRpcInterface";
import { assert } from "chai";

Logger.initializeToConsole();
Logger.setLevelDefault(LogLevel.Warning);
RpcConfiguration.disableRoutingValidation = false;

function initializeCloud(protocol: string) {
  const port = Number(window.location.port) + 2000;
  const mobilePort = port + 2000;

  const config = BentleyCloudRpcManager.initializeClient({ info: { title: "rpc-full-stack-test", version: "v1.0" } }, rpcInterfaces);
  config.protocol.pathPrefix = `${protocol}://${window.location.hostname}:${port}`;

  initializeMultipleClientsTest(config.protocol.pathPrefix);
  initializeAttachedInterfacesTest(config);
  setupMockMobileFrontend(mobilePort);
}

function setupMockMobileFrontend(port: number) {
  window.location.hash = `port=${port}`;
  MobileRpcManager.initializeClient([MobileTestInterface]);
}

function initializeMultipleClientsTest(path: string) {
  const config1 = BentleyCloudRpcManager.initializeClient(
    { info: { title: `rpc-full-stack-test-config${MultipleClientsInterface.config1.id}`, version: "v1.0" } },
    [MultipleClientsInterface],
    MultipleClientsInterface.config1,
  );

  config1.protocol.pathPrefix = path;

  const config2 = BentleyCloudRpcManager.initializeClient(
    { info: { title: `rpc-full-stack-test-config${MultipleClientsInterface.config2.id}`, version: "v1.0" } },
    [MultipleClientsInterface],
    MultipleClientsInterface.config2,
  );

  config2.protocol.pathPrefix = path;
}

function initializeAttachedInterfacesTest(config: BentleyCloudRpcConfiguration) {
  config.attach(AttachedInterface);
}

export let currentEnvironment: string;

before(async () => {
  currentEnvironment = await executeBackendCallback(BackendTestCallbacks.getEnvironment);
  switch (currentEnvironment) {
    case "http":
      return initializeCloud("http");
    case "electron":
      return ElectronApp.startup({ iModelApp: { rpcInterfaces } });
  }
});

describe("BentleyCloudRpcManager", () => {
  it("should initialize correctly when routing validation is enabled", async () => {
    if (currentEnvironment === "http") {
      const protocol = TestRpcInterface.getClient().configuration.protocol as WebAppRpcProtocol;
      assert.equal(protocol.allowedHeaders.size, 0);
      await TestRpcInterface.getClient().op16({ iModelId: "foo", key: "bar" }, { iModelId: "foo", key: "bar" });
      assert.isAtLeast(protocol.allowedHeaders.size, 1);
    }
  });

  after(() => {
    RpcConfiguration.disableRoutingValidation = true;
  });
});
