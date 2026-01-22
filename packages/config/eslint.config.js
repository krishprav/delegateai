import baseConfig from "@delegate/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    ignores: ["dist/**"],
  },
  {
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
];
