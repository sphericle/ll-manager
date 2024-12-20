import Globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs"
    }
  },
  {
    languageOptions: {
      globals: {
        ...Globals.browser,
        "Buffer": "readonly",
        "__dirname": "readonly",
        "process": "readonly"
      }
    }
  },
  pluginJs.configs.recommended,
];