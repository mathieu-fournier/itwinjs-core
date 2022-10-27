/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/*",* @type {import("beachball").BeachballConfig } */
module.exports = {
  access: "public",
  defaultNpmTag: "nightly",
  disallowedChangeTypes: ["major"],
  groups: [
    {
      name: "lock-step",
      include: [
        "clients/*",
        "core/**",
        "domains/**",
        "editor/**",
        "extensions/**",
        "presentation/**",
        "tools/**",
        "ui/**",
        "utils/**",
      ],
      exclude: ["extensions/test-extension", "presentation/scripts", "tools/internal"],
      disallowedChangeTypes: ["major", "minor", "patch"],
    },
  ],
  prereleasePrefix: "dev"
};
