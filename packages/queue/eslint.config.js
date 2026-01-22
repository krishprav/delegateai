import { config } from "@delegate/eslint-config/base";
export default [
  ...config,
  {
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];

