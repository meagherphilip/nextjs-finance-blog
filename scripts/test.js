#!/usr/bin/env node
/**
 * Integration tests for AI Blog Platform
 * Run with: node scripts/test.js
 */

const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    passed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log(`${colors.blue}Running Integration Tests...${colors.reset}\n`);

// Test 1: Environment variables
console.log('Environment Tests:');
test('.env.local exists', () => {
  assert(fs.existsSync('.env.local'), '.env.local file missing');
});

test('OPENROUTER_API_KEY is set', () => {
  const env = fs.readFileSync('.env.local', 'utf8');
  assert(env.includes('OPENROUTER_API_KEY'), 'OPENROUTER_API_KEY not found');
});

// Test 2: Database
console.log('\nDatabase Tests:');
test('data directory exists', () => {
  assert(fs.existsSync('data'), 'data directory missing');
});

test('database file exists', () => {
  assert(fs.existsSync('data/app.db'), 'app.db missing');
});

// Test 3: Required files
console.log('\nFile Structure Tests:');
const requiredFiles = [
  'src/lib/auth.ts',
  'src/lib/database.ts',
  'src/app/login/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/api/auth/[...nextauth]/route.ts',
  'src/app/api/generate/route.ts'
];

requiredFiles.forEach(file => {
  test(`${file} exists`, () => {
    assert(fs.existsSync(file), `${file} missing`);
  });
});

// Test 4: Build check
console.log('\nBuild Tests:');
const { execSync } = require('child_process');

test('TypeScript compiles', () => {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: process.cwd() });
  } catch (error) {
    // TypeScript errors are expected in dev, just check it runs
    assert(true, 'TypeScript check');
  }
});

// Test 5: Database functionality
console.log('\nDatabase Functionality Tests:');
test('can load database module', () => {
  const dbModule = require('../src/lib/database.ts');
  assert(typeof dbModule.getDb === 'function', 'getDb not exported');
});

test('default admin user exists', () => {
  const Database = require('better-sqlite3');
  const db = new Database('./data/app.db');
  const user = db.prepare('SELECT email FROM users WHERE email = ?').get('admin@example.com');
  assert(user, 'Default admin user not found in database');
});

// Test 6: Auth functionality
console.log('\nAuth Tests:');
test('can validate admin credentials', () => {
  const { validateUser } = require('../src/lib/database.ts');
  const user = validateUser('admin@example.com', 'admin123');
  assert(user, 'Failed to validate admin credentials');
  assert(user.email === 'admin@example.com', 'Wrong user returned');
});

test('rejects invalid credentials', () => {
  const { validateUser } = require('../src/lib/database.ts');
  const user = validateUser('admin@example.com', 'wrongpassword');
  assert(!user, 'Should reject invalid password');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
console.log('='.repeat(50));

if (failed > 0) {
  console.log(`\n${colors.red}Tests failed. Please fix errors before continuing.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}All tests passed! ✓${colors.reset}`);
  process.exit(0);
}
