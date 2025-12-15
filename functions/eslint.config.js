const { defineConfig } = require("eslint/lib/shared/config");

module.exports = defineConfig([
  {
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "google",
    ],
  },

  {
    ignores: ["lib/**", "node_modules/", "**/.*"],
  },

  {
    files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
    languageOptions: {
      parser: require.resolve("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      import: require("eslint-plugin-import"),
    },
    rules: {
      quotes: ["error", "double"],
      indent: ["error", 2],
      "no-var": "error",
      "import/no-unresolved": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
    },
  },
]);
