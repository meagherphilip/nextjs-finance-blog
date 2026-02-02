#!/usr/bin/env node
/**
 * Integration Tests for AI Blog Platform
 * Tests all external APIs and integrations
 * Run with: npm run test:integration
 */

const https = require('https');
const http = require('http');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

let passed = 0;
let failed = 0;
let warnings = 0;

async function test(name, fn, required = true) {
  try {
    await fn();
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    passed++;
  } catch (error) {
    if (required) {
      console.log(`${colors.red}✗${colors.reset} ${name}`);
      console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
      failed++;
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} ${name}`);
      console.log(`  ${colors.yellow}Warning: ${error.message}${colors.reset}`);
      warnings++;
    }
  }
}

function logSection(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

// Test 1: Environment Variables
logSection('1. ENVIRONMENT VARIABLES');

await test('NEXTAUTH_SECRET is set', () => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret === 'your-secret-key-here-change-in-production') {
    throw new Error('NEXTAUTH_SECRET not set or using default value');
  }
});

await test('OPENROUTER_API_KEY is set', () => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not set');
  if (!key.startsWith('sk-or-')) throw new Error('Invalid key format');
}, true);

await test('BRAVE_API_KEY is set', () => {
  const key = process.env.BRAVE_API_KEY;
  if (!key) throw new Error('BRAVE_API_KEY not set');
}, true);

// Test 2: OpenRouter API
logSection('2. OPENROUTER API (AI Generation)');

await test('OpenRouter API responds', async () => {
  return new Promise((resolve, reject) => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      reject(new Error('No API key available'));
      return;
    }

    const data = JSON.stringify({
      model: 'openrouter/moonshotai/kimi-k2.5',
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 50
    });

    const req = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:3000',
        'X-Title': 'AI Blog Generator Test'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve();
        } else if (res.statusCode === 401) {
          reject(new Error('401 Unauthorized - API key invalid or expired'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}, true);

await test('OpenRouter returns valid response', async () => {
  return new Promise((resolve, reject) => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      reject(new Error('No API key available'));
      return;
    }

    const data = JSON.stringify({
      model: 'openrouter/moonshotai/kimi-k2.5',
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 50
    });

    const req = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:3000',
        'X-Title': 'AI Blog Generator Test'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (!response.choices || !response.choices[0]) {
            reject(new Error('Invalid response format'));
          }
          console.log(`  ${colors.gray}Model: ${response.model || 'unknown'}${colors.reset}`);
          console.log(`  ${colors.gray}Response: "${response.choices[0].message.content.substring(0, 50)}..."${colors.reset}`);
          resolve();
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}, true);

// Test 3: Brave Search API
logSection('3. BRAVE SEARCH API (Research)');

await test('Brave API responds', async () => {
  return new Promise((resolve, reject) => {
    const key = process.env.BRAVE_API_KEY;
    if (!key) {
      reject(new Error('No API key available'));
      return;
    }

    const req = https.request({
      hostname: 'api.search.brave.com',
      path: '/res/v1/web/search?q=test&count=1',
      method: 'GET',
      headers: {
        'X-Subscription-Token': key,
        'Accept': 'application/json'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve();
        } else if (res.statusCode === 401) {
          reject(new Error('401 Unauthorized - API key invalid'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}, true);

await test('Brave API returns search results', async () => {
  return new Promise((resolve, reject) => {
    const key = process.env.BRAVE_API_KEY;
    if (!key) {
      reject(new Error('No API key available'));
      return;
    }

    const req = https.request({
      hostname: 'api.search.brave.com',
      path: '/res/v1/web/search?q=emergency+fund+statistics&count=3',
      method: 'GET',
      headers: {
        'X-Subscription-Token': key,
        'Accept': 'application/json'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (!response.web || !response.web.results) {
            reject(new Error('No search results'));
          }
          console.log(`  ${colors.gray}Found ${response.web.results.length} results${colors.reset}`);
          console.log(`  ${colors.gray}Top result: "${response.web.results[0].title.substring(0, 50)}..."${colors.reset}`);
          resolve();
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}, true);

// Test 4: Database
logSection('4. DATABASE');

await test('Database file exists', () => {
  const fs = require('fs');
  if (!fs.existsSync('./data/app.db')) {
    throw new Error('Database file not found at ./data/app.db');
  }
});

await test('Database has all required tables', () => {
  const Database = require('better-sqlite3');
  const db = new Database('./data/app.db');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  const tableNames = tables.map(t => t.name);
  
  const required = ['users', 'themes', 'blogs', 'generations', 'research'];
  const missing = required.filter(t => !tableNames.includes(t));
  
  if (missing.length > 0) {
    throw new Error(`Missing tables: ${missing.join(', ')}`);
  }
  
  console.log(`  ${colors.gray}Tables: ${tableNames.join(', ')}${colors.reset}`);
});

await test('Database has admin user', () => {
  const Database = require('better-sqlite3');
  const db = new Database('./data/app.db');
  const user = db.prepare("SELECT id, email, role FROM users WHERE email = 'admin@example.com'").get();
  
  if (!user) {
    throw new Error('Admin user not found');
  }
  
  if (user.role !== 'admin') {
    throw new Error('User exists but is not admin');
  }
  
  console.log(`  ${colors.gray}Admin user: ${user.email} (${user.role})${colors.reset}`);
});

// Test 5: Local Server
logSection('5. LOCAL SERVER');

await test('Server is running on port 3000', async () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve();
    });
    
    req.on('error', () => reject(new Error('Server not responding on port 3000')));
    req.on('timeout', () => reject(new Error('Connection timeout')));
    req.end();
  });
}, true);

await test('Login page is accessible', async () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (body.includes('AI Blog Generator')) {
          resolve();
        } else {
          reject(new Error('Login page missing expected content'));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
});

await test('API endpoints are accessible', async () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/posts',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`API returned ${res.statusCode}`));
      }
    });
    
    req.on('error', reject);
    req.end();
  });
});

// Summary
console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}`);
console.log(`${colors.yellow}⚠ Warnings: ${warnings}${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

if (failed > 0) {
  console.log(`${colors.red}INTEGRATION TESTS FAILED${colors.reset}`);
  console.log(`${colors.yellow}Fix the errors above before continuing.${colors.reset}\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`${colors.yellow}TESTS PASSED WITH WARNINGS${colors.reset}`);
  console.log(`${colors.gray}Some optional features may not work.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.green}ALL INTEGRATION TESTS PASSED! ✓${colors.reset}\n`);
  process.exit(0);
}
