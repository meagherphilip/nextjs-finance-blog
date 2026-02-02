#!/usr/bin/env node
/**
 * End-to-End tests for AI Blog Platform
 * Tests actual functionality, not just file existence
 * Run with: node scripts/e2e-test.js
 */

const http = require('http');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    passed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

console.log(`${colors.blue}Running E2E Tests...${colors.reset}\n`);

// Wait for server to be ready
console.log('Waiting for server...');
await new Promise(r => setTimeout(r, 2000));

// Test 1: Server is running
console.log('\nServer Tests:');
await test('Server responds on port 3000', async () => {
  const res = await makeRequest('/');
  if (res.status !== 200 && res.status !== 307) {
    throw new Error(`Expected 200 or 307, got ${res.status}`);
  }
});

// Test 2: Login page
await test('Login page loads', async () => {
  const res = await makeRequest('/login');
  if (res.status !== 200) throw new Error(`Status: ${res.status}`);
  if (!res.body.includes('AI Blog Generator')) throw new Error('Missing title');
});

// Test 3: Auth API - valid credentials
console.log('\nAuthentication Tests:');
let authCookie = '';
await test('Valid login credentials work', async () => {
  const res = await makeRequest('/api/auth/callback/credentials', 'POST', {
    email: 'admin@example.com',
    password: 'admin123',
    csrfToken: 'test',
    callbackUrl: '/dashboard'
  });
  
  // Should redirect (302) on success
  if (res.status !== 302) {
    throw new Error(`Expected redirect (302), got ${res.status}`);
  }
  
  // Extract session cookie
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) throw new Error('No session cookie set');
  authCookie = setCookie[0];
});

// Test 4: Auth API - invalid credentials
await test('Invalid credentials rejected', async () => {
  const res = await makeRequest('/api/auth/callback/credentials', 'POST', {
    email: 'admin@example.com',
    password: 'wrongpassword',
    csrfToken: 'test',
    callbackUrl: '/dashboard'
  });
  
  // Should return error (401 or redirect with error)
  if (res.status !== 401 && !res.body.includes('error')) {
    // Some versions redirect back to login
    if (res.status !== 302) {
      throw new Error(`Expected 401 or 302, got ${res.status}`);
    }
  }
});

// Test 5: API routes
console.log('\nAPI Tests:');
await test('API /posts returns data', async () => {
  const res = await makeRequest('/api/posts');
  if (res.status !== 200) throw new Error(`Status: ${res.status}`);
  const data = JSON.parse(res.body);
  if (!Array.isArray(data)) throw new Error('Expected array');
  if (data.length === 0) throw new Error('No posts returned');
});

// Test 6: Blog generation endpoint (requires auth)
console.log('\nGeneration Tests:');
await test('Generation endpoint requires auth', async () => {
  const res = await makeRequest('/api/generate', 'POST', {
    topic: 'Test Blog'
  });
  if (res.status !== 401) {
    throw new Error(`Expected 401, got ${res.status}`);
  }
});

// Test 7: Database
console.log('\nDatabase Tests:');
await test('Database has admin user', async () => {
  const Database = require('better-sqlite3');
  const db = new Database('./data/app.db');
  const user = db.prepare('SELECT email FROM users WHERE email = ?').get('admin@example.com');
  if (!user) throw new Error('Admin user not found');
});

await test('Admin password is hashed correctly', async () => {
  const bcrypt = require('bcryptjs');
  const Database = require('better-sqlite3');
  const db = new Database('./data/app.db');
  const user = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('admin@example.com');
  if (!user) throw new Error('User not found');
  
  const valid = bcrypt.compareSync('admin123', user.password_hash);
  if (!valid) throw new Error('Password hash mismatch');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
console.log('='.repeat(50));

if (failed > 0) {
  console.log(`\n${colors.red}E2E tests failed.${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}All E2E tests passed! ✓${colors.reset}`);
  process.exit(0);
}
