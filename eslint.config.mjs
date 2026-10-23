import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".open-next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/data/json/**",
    "current_page.tsx",
    "scripts/**",
  ]),
  {
    plugins: {
      "react-hooks": nextVitals[0].plugins["react-hooks"],
      "@typescript-eslint": nextTs[0].plugins["@typescript-eslint"],
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    }
  }
]);

export default eslintConfig;
