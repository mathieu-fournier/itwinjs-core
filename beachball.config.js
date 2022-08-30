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
        "extensions/*",
        "presentation/*",
        "tools/*",
        "ui/*",
        "utils/*",
      ],
      exclude: ["extensions/test-extension", "presentation/scripts"],
    },
  ],
  prereleasePrefix: "dev"
};
