#!/usr/bin/env node
/**
 * Autonomous Blog Generation Cron Job
 * Generates blogs automatically based on themes and schedules
 * Run via: node scripts/auto-generate.js
 * Or schedule via cron: 0 9 * * * node scripts/auto-generate.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  apiBaseUrl: process.env.API_URL || 'http://localhost:3000',
  authToken: process.env.AUTH_TOKEN,
  defaultAuthor: process.env.DEFAULT_AUTHOR_ID || 'system',
  
  // Generation settings
  dailyLimit: parseInt(process.env.DAILY_LIMIT) || 3,
  targetLength: parseInt(process.env.TARGET_LENGTH) || 2500,
  tone: process.env.TONE || 'professional',
  voice: process.env.VOICE || 'expert',
  
  // Topic queue
  topicQueueFile: './data/topic-queue.json',
};

// Sample topic queues by category
const DEFAULT_TOPICS = {
  finance: [
    { topic: "How to Build a 6-Month Emergency Fund", keywords: ["emergency fund", "savings", "financial security"], priority: 1 },
    { topic: "The Complete Guide to Index Fund Investing", keywords: ["index funds", "investing", "passive income"], priority: 1 },
    { topic: "Understanding Your Credit Score: The Ultimate Guide", keywords: ["credit score", "credit report", "FICO"], priority: 2 },
    { topic: "How to Pay Off $50,000 in Debt in 2 Years", keywords: ["debt payoff", "debt snowball", "financial freedom"], priority: 1 },
    { topic: "The FIRE Movement: Retire Early in 10 Steps", keywords: ["FIRE", "financial independence", "early retirement"], priority: 2 },
    { topic: "Tax Loss Harvesting: Save Thousands on Taxes", keywords: ["tax loss harvesting", "taxes", "investing"], priority: 3 },
    { topic: "How to Negotiate a $10,000+ Salary Raise", keywords: ["salary negotiation", "career", "income"], priority: 2 },
    { topic: "Real Estate vs Stocks: Where to Invest in 2024", keywords: ["real estate", "stocks", "investment comparison"], priority: 2 },
    { topic: "The 50/30/20 Budget Rule Explained with Examples", keywords: ["budgeting", "50/30/20", "money management"], priority: 1 },
    { topic: "How to Save Your First $100,000", keywords: ["savings goals", "wealth building", "first 100k"], priority: 1 },
  ],
  investing: [
    { topic: "Dollar-Cost Averaging vs Lump Sum: Which Wins?", keywords: ["DCA", "lump sum", "investing strategy"], priority: 1 },
    { topic: "REITs Explained: Real Estate Without the Headache", keywords: ["REITs", "real estate investing", "dividends"], priority: 2 },
    { topic: "Bonds vs Bond Funds: What's Better for You?", keywords: ["bonds", "fixed income", "portfolio allocation"], priority: 3 },
    { topic: "How to Build a 3-Fund Portfolio", keywords: ["three fund portfolio", "simple investing", "Bogleheads"], priority: 1 },
    { topic: "International Investing: Why You Need Global Stocks", keywords: ["international stocks", "global diversification", "emerging markets"], priority: 2 },
  ],
  side_hustle: [
    { topic: "15 Side Hustles That Pay $1,000+ Per Month", keywords: ["side hustle", "extra income", "freelancing"], priority: 1 },
    { topic: "How to Start a Profitable Blog in 30 Days", keywords: ["blogging", "online business", "content creation"], priority: 2 },
    { topic: "Freelance Writing: From $0 to $5,000/Month", keywords: ["freelance writing", "remote work", "copywriting"], priority: 2 },
    { topic: "Selling Digital Products: Passive Income Guide", keywords: ["digital products", "passive income", "online courses"], priority: 2 },
  ],
};

// Logging
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
  
  // Also log to file
  const logFile = './data/generation-log.txt';
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

// Load or create topic queue
function loadTopicQueue() {
  if (fs.existsSync(CONFIG.topicQueueFile)) {
    return JSON.parse(fs.readFileSync(CONFIG.topicQueueFile, 'utf8'));
  }
  
  // Initialize with default topics
  const queue = {
    lastGenerated: null,
    generatedToday: 0,
    topics: [...DEFAULT_TOPICS.finance, ...DEFAULT_TOPICS.investing, ...DEFAULT_TOPICS.side_hustle],
    completed: [],
  };
  
  saveTopicQueue(queue);
  return queue;
}

function saveTopicQueue(queue) {
  fs.writeFileSync(CONFIG.topicQueueFile, JSON.stringify(queue, null, 2));
}

// Check if we should generate today
function shouldGenerate(queue) {
  const today = new Date().toISOString().split('T')[0];
  
  // Reset counter if it's a new day
  if (queue.lastGenerated !== today) {
    queue.generatedToday = 0;
    queue.lastGenerated = today;
    saveTopicQueue(queue);
  }
  
  if (queue.generatedToday >= CONFIG.dailyLimit) {
    log(`Daily limit reached (${CONFIG.dailyLimit}). Skipping generation.`);
    return false;
  }
  
  if (queue.topics.length === 0) {
    log('No topics in queue. Skipping generation.');
    return false;
  }
  
  return true;
}

// Select next topic (by priority)
function selectNextTopic(queue) {
  // Sort by priority (1 = highest)
  queue.topics.sort((a, b) => a.priority - b.priority);
  return queue.topics[0];
}

// Generate blog via API
async function generateBlog(topic) {
  try {
    log(`Starting generation: "${topic.topic}"`);
    
    const response = await fetch(`${CONFIG.apiBaseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In production, use proper auth
        'Cookie': 'next-auth.session-token=test',
      },
      body: JSON.stringify({
        topic: topic.topic,
        keywords: topic.keywords,
        tone: CONFIG.tone,
        voice: CONFIG.voice,
        targetLength: CONFIG.targetLength,
        researchTopic: true,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    log(`Generation started: ${data.generationId}`, 'success');
    return data.generationId;
    
  } catch (error) {
    log(`Failed to generate: ${error.message}`, 'error');
    return null;
  }
}

// Wait and check generation status
async function waitForCompletion(generationId, maxWaitMs = 300000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      const response = await fetch(
        `${CONFIG.apiBaseUrl}/api/generate/status?id=${generationId}`
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.status === 'completed') {
        log(`Generation completed: ${data.output}`, 'success');
        return data.output;
      }
      
      if (data.status === 'failed') {
        log(`Generation failed: ${data.error}`, 'error');
        return null;
      }
      
      // Still processing, wait 10 seconds
      await new Promise(r => setTimeout(r, 10000));
      
    } catch (error) {
      log(`Status check error: ${error.message}`, 'error');
      await new Promise(r => setTimeout(r, 10000));
    }
  }
  
  log('Generation timeout', 'error');
  return null;
}

// Main execution
async function main() {
  log('=== Auto-Generation Cron Started ===');
  
  // Ensure data directory exists
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
  }
  
  const queue = loadTopicQueue();
  
  if (!shouldGenerate(queue)) {
    log('Generation skipped.');
    return;
  }
  
  const topic = selectNextTopic(queue);
  log(`Selected topic: "${topic.topic}" (priority: ${topic.priority})`);
  
  const generationId = await generateBlog(topic);
  
  if (!generationId) {
    log('Generation failed to start', 'error');
    return;
  }
  
  // Wait for completion
  const blogId = await waitForCompletion(generationId);
  
  if (blogId) {
    // Move topic from queue to completed
    queue.completed.push({
      ...topic,
      blogId,
      generatedAt: new Date().toISOString(),
    });
    queue.topics = queue.topics.filter(t => t.topic !== topic.topic);
    queue.generatedToday++;
    saveTopicQueue(queue);
    
    log(`Blog created successfully: ${blogId}`, 'success');
  }
  
  log('=== Auto-Generation Cron Finished ===');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { main, loadTopicQueue };
