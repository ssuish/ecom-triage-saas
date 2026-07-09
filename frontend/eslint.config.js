import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const restrictedSyntaxRules = [
  {
    selector: "JSXElement[openingElement.name.name='button']",
    message:
      "Use Button from @/shared/components/ui/button instead of raw <button>.",
  },
  {
    selector: "JSXElement[openingElement.name.name='select']",
    message:
      "Use Select from @/shared/components/ui/select instead of raw <select>.",
  },
  {
    selector: "JSXElement[openingElement.name.name='input']",
    message:
      "Use Input from @/shared/components/ui/input instead of raw <input>.",
  },
  {
    selector: "JSXElement[openingElement.name.name='textarea']",
    message:
      "Use Textarea from @/shared/components/ui/textarea instead of raw <textarea>.",
  },
];

const restrictedImportsRule = [
  "error",
  {
    paths: [
      {
        name: "@base-ui/react",
        message:
          "Import shadcn wrappers from @/shared/components/ui/* instead of @base-ui/react.",
      },
    ],
    patterns: [
      {
        group: ["@base-ui/react/*"],
        message:
          "Import shadcn wrappers from @/shared/components/ui/* instead of @base-ui/react.",
      },
    ],
  },
];

export default tseslint.config(
  {
    ignores: ["dist/**", "src/routeTree.gen.ts"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}", "src/routes/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...restrictedSyntaxRules],
      "no-restricted-imports": restrictedImportsRule,
    },
  },
  {
    files: ["src/shared/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": "off",
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["src/**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
