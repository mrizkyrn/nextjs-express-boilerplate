/**
 * Jest Global Setup
 *
 * This file runs AFTER the test framework is loaded (setupFilesAfterEnv).
 * Environment variables are loaded in jest.config.js BEFORE tests run.
 *
 * Use this file for:
 * - Required imports (reflect-metadata for TSyringe)
 * - Global test utilities and helpers
 * - Global mocks that apply to all tests
 * - Custom Jest matchers
 */

// Required for TSyringe dependency injection decorators
import 'reflect-metadata';

// Silence console logs during tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
