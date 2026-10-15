// NestJS 12 is ESM. Keep the existing Jest mock API available in ESM test files.
globalThis.jest = require('@jest/globals').jest;
