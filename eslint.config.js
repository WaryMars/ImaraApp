import { defineConfig } from "eslint/config";
// Importer les presets nécessaires
import expoConfig from "eslint-config-expo/flat";

export default defineConfig([
  // Expo config (ou autre config de base que tu utilises)
  expoConfig,

  // Ignore les fichiers construits, node_modules et dotfiles
  {
    ignores: ["**/lib/**", "node_modules/", "**/.*"],
  },

  // Configuration TS & règles
  {
    files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        // ajoute ton tsconfig pour le parser TS
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      quotes: ["error", "double"],
      indent: ["error", 2],
      "no-var": "error",
      "import/no-unresolved": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
      // ajoute d’autres règles que tu souhaites...
    },
  },
]);
