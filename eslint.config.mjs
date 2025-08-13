import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores - these files/directories will be completely ignored
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**", 
      "build/**",
      "dist/**",
      "src/generated/**",
      "**/*.generated.*",
      "prisma/generated/**",
      // Add any other generated directories you have
    ]
  },
  
  // Extend Next.js recommended config
  ...compat.extends("next/core-web-vitals"),
  
  // Your custom rules
  {
    rules: {
      // Add any custom ESLint rules here
      // For example:
      // "@typescript-eslint/no-unused-vars": "warn",
      // "@typescript-eslint/no-unused-expressions": "warn",
    }
  }
];

export default eslintConfig;