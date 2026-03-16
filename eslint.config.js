import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  // Base recommended rules
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Disable rules that conflict with Prettier
  eslintConfigPrettier,

  // Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.moose/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/generated/**",
      "**/prisma/generated/**",
    ],
  },

  // CommonJS config files (postcss.config.cjs, etc.)
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },

  // TypeScript overrides
  {
    rules: {
      // Allow unused vars prefixed with underscore
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Allow explicit any (many workspace packages use it)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow require imports (some configs use them)
      "@typescript-eslint/no-require-imports": "off",
      // Allow empty interfaces extending other types (common in React component patterns)
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
);
