import js from "@eslint/js";
import tseslint from "typescript-eslint";
export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".arkiv-guidance/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
      "examples/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  { files: ["*.mjs"], languageOptions: { globals: { process: "readonly" } } },
);
