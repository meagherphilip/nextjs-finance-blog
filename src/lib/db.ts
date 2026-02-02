import Database from 'better-sqlite3';
import { Post } from '../types';

const db = new Database('./blog.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    author TEXT NOT NULL,
    tags TEXT NOT NULL
  )
`);

export function getAllPosts(): Post[] {
  const stmt = db.prepare('SELECT * FROM posts ORDER BY date DESC');
  const rows = stmt.all() as any[];
  return rows.map(row => ({
    ...row,
    tags: JSON.parse(row.tags)
  }));
}

export function getPostBySlug(slug: string): Post | undefined {
  const stmt = db.prepare('SELECT * FROM posts WHERE slug = ?');
  const row = stmt.get(slug) as any;
  if (!row) return undefined;
  return {
    ...row,
    tags: JSON.parse(row.tags)
  };
}

export function getPostsByTag(tag: string): Post[] {
  const stmt = db.prepare('SELECT * FROM posts');
  const rows = stmt.all() as any[];
  return rows
    .map(row => ({ ...row, tags: JSON.parse(row.tags) }))
    .filter(post => post.tags.includes(tag));
}

export function createPost(post: Omit<Post, 'id'>): Post {
  const stmt = db.prepare(`
    INSERT INTO posts (title, slug, excerpt, content, date, author, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    post.title,
    post.slug,
    post.excerpt,
    post.content,
    post.date,
    post.author,
    JSON.stringify(post.tags)
  );
  return { ...post, id: result.lastInsertRowid.toString() };
}

export function seedFinancePosts(): void {
  const count = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
  if (count.count > 0) return;

  const financePosts = [
    {
      title: 'Understanding Compound Interest: The Eighth Wonder of the World',
      slug: 'understanding-compound-interest',
      excerpt: 'Learn how compound interest works and why Einstein allegedly called it the eighth wonder of the world.',
      content: `Compound interest is the most powerful force in the universe. When you understand it, you earn it. When you don't, you pay it.

## What is Compound Interest?

Compound interest is interest calculated on the initial principal and also on the accumulated interest of previous periods. It's essentially "interest on interest."

## The Rule of 72

A quick way to estimate how long it takes to double your money:

\`\`\`
Years = 72 / Interest Rate
\`\`\`

At 8% annual return, your money doubles every 9 years.

## Real World Impact

- $10,000 invested at age 25 with 8% returns = $217,000 at age 65
- The same amount invested at age 35 = $100,000 at age 65

Start early. Time is your greatest asset.`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'investing', 'compound-interest']
    },
    {
      title: 'Building an Emergency Fund: Your Financial Safety Net',
      slug: 'building-emergency-fund',
      excerpt: 'Why every household needs 3-6 months of expenses saved before investing.',
      content: `Before you invest a single dollar in the stock market, you need an emergency fund. This is non-negotiable.

## Why 3-6 Months?

- 3 months if you have stable income + dual earners
- 6+ months if single earner or variable income
- Some experts now recommend 8-12 months post-pandemic

## Where to Keep It

- High-yield savings account (4-5% APY currently)
- Money market account
- NOT in stocks, crypto, or locked investments

## The Psychological Benefit

Knowing you can handle a $3,000 car repair or job loss without panic is worth more than the extra 2-3% you'd get from investments.`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'emergency-fund', 'savings']
    },
    {
      title: 'Index Funds vs Individual Stocks: Why Buffett Recommends the Former',
      slug: 'index-funds-vs-stocks',
      excerpt: 'Warren Buffett\'s bet and why most investors should stick to broad market index funds.',
      content: `In 2007, Warren Buffett bet $1 million that an S&P 500 index fund would beat any group of hedge funds over 10 years. He won.

## Why Index Funds Win

- **Low fees**: 0.03% vs 1-2% for active management
- **Diversification**: Own 500+ companies instantly
- **Consistency**: 90% of active managers underperform the index over 15 years

## The Math

A 1% fee difference on $100,000 over 30 years:
- 7% return: $761,000
- 6% return: $574,000

That's $187,000 lost to fees.

## When Individual Stocks Make Sense

- You enjoy researching companies
- You're willing to lose the money
- It's play money (<10% of portfolio)`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'investing', 'index-funds', 'stocks']
    },
    {
      title: 'The 50/30/20 Budget Rule: A Simple Framework',
      slug: '50-30-20-budget-rule',
      excerpt: 'Senator Elizabeth Warren\'s simple budgeting framework for financial success.',
      content: `Budgeting doesn't have to be complicated. The 50/30/20 rule is a simple starting point.

## The Breakdown

**50% Needs**
- Rent/mortgage
- Utilities
- Groceries
- Minimum debt payments
- Insurance

**30% Wants**
- Dining out
- Entertainment
- Hobbies
- Vacations

**20% Savings & Debt**
- Emergency fund
- Retirement contributions
- Extra debt payments

## Adjusting for Reality

If you're in a high-cost area, needs might be 60%. If you're aggressively saving for FIRE, you might do 50/20/30.

The key is intentional spending, not perfection.`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'budgeting', 'money-management']
    },
    {
      title: 'Tax-Advantaged Accounts: IRA vs 401(k) Explained',
      slug: 'ira-vs-401k-explained',
      excerpt: 'Maximize your retirement savings by understanding the differences between these accounts.',
      content: `The US tax code gives you ways to save for retirement with tax advantages. Use them.

## 401(k): Employer-Sponsored

- **2025 limit**: $23,500 ($31,000 if 50+)
- Employer match = free money
- Traditional: Tax deduction now, taxed on withdrawal
- Roth: Taxed now, tax-free growth

## IRA: Individual Retirement Account

- **2025 limit**: $7,000 ($8,000 if 50+)
- More investment options than most 401(k)s
- Income limits for Roth IRA deductions

## The Optimal Order

1. 401(k) up to employer match
2. Max out IRA
3. Back to 401(k) if possible
4. Taxable brokerage for overflow

Tax-advantaged growth is one of the best deals in finance.`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'retirement', 'taxes', 'investing']
    },
    {
      title: 'Credit Scores Demystified: How to Build and Maintain Excellent Credit',
      slug: 'credit-scores-demystified',
      excerpt: 'Understanding the five factors that determine your FICO score and how to optimize them.',
      content: `Your credit score affects loan rates, insurance premiums, and even job applications. Understand it.

## The Five Factors

1. **Payment History (35%)**: Pay on time, always
2. **Credit Utilization (30%)**: Keep under 10%, definitely under 30%
3. **Length of History (15%)**: Keep old accounts open
4. **Credit Mix (10%)**: Cards + loans helps slightly
5. **New Credit (10%)**: Hard inquiries ding temporarily

## Quick Wins

- Set all bills to autopay
- Request credit limit increases (lowers utilization)
- Don't close your oldest card
- Check reports annually at AnnualCreditReport.com

## Credit Cards Are Tools

Used responsibly, they provide rewards, purchase protection, and build credit. Used poorly, they're wealth destroyers.`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'credit', 'credit-score']
    },
    {
      title: 'Dollar-Cost Averaging: Remove Emotion from Investing',
      slug: 'dollar-cost-averaging',
      excerpt: 'Why investing the same amount regularly beats trying to time the market.',
      content: `The best time to invest was yesterday. The second best time is today. Dollar-cost averaging makes this automatic.

## How It Works

Invest a fixed amount at regular intervals regardless of market conditions.

- Market high: Your fixed amount buys fewer shares
- Market low: Your fixed amount buys more shares
- Result: Average cost per share is lower than the average price

## The Psychology

Humans are terrible at market timing:
- We buy high (FOMO)
- We sell low (panic)
- DCA removes the decision

## Real Example

$500/month into S&P 500 for 20 years at average historical returns: ~$275,000 invested becomes ~$600,000.

Consistency beats timing.`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'investing', 'dca', 'strategy']
    },
    {
      title: 'The FIRE Movement: Financial Independence, Retire Early',
      slug: 'fire-movement-explained',
      excerpt: 'How some people retire in their 30s and 40s through aggressive saving and investing.',
      content: `FIRE isn't about retiring to do nothing. It's about having the freedom to do what you want, when you want.

## The Math

The 4% Rule: You need 25x your annual expenses invested.

- Spend $40,000/year → Need $1,000,000
- Spend $60,000/year → Need $1,500,000

## Savings Rate is Everything

- 10% savings rate → Work 50+ years
- 50% savings rate → Work ~17 years
- 70% savings rate → Work ~8 years

## Types of FIRE

- **LeanFIRE**: Minimal expenses, bare-bones
- **FatFIRE**: $100k+/year spending in retirement
- **BaristaFIRE**: Part-time work covers expenses
- **CoastFIRE**: Save early, let compound interest do the rest

Extreme? Maybe. But the principles work at any level.`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'fire', 'retirement', 'savings']
    },
    {
      title: 'Understanding Inflation: The Silent Wealth Killer',
      slug: 'understanding-inflation',
      excerpt: 'Why keeping cash under your mattress costs you money, and how to protect against inflation.',
      content: `Inflation averages 2-3% annually. At 3%, your money loses half its purchasing power in 23 years.

## What Drives Inflation

- Money supply increases
- Supply chain disruptions
- Wage-price spirals
- Energy costs

## Protecting Your Wealth

**Stocks**: Historically beat inflation by 6-7%
**Real Estate**: Rents and values typically rise with inflation
**I-Bonds**: Government bonds that track inflation exactly
**TIPS**: Treasury Inflation-Protected Securities

## Cash is NOT King

A "high-yield" savings account at 4% with 3% inflation = 1% real return.

Savings accounts hold purchasing power. Investments grow it.

Understand the difference between nominal and real returns.`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'inflation', 'investing', 'economics']
    },
    {
      title: 'Debt Avalanche vs Snowball: Which Payoff Strategy Wins?',
      slug: 'debt-avalanche-vs-snowball',
      excerpt: 'Mathematically, one saves more money. Psychologically, the other might work better.',
      content: `You have multiple debts. Which do you pay first?

## Debt Avalanche (Mathematically Optimal)

Pay minimums on everything, throw extra at highest interest rate first.

- Saves the most money
- Fastest payoff mathematically
- Requires discipline

## Debt Snowball (Psychologically Powerful)

Pay minimums on everything, throw extra at smallest balance first.

- Quick wins build momentum
- More people stick with it
- Costs slightly more in interest

## Example

- $3,000 at 20% (credit card)
- $10,000 at 6% (student loan)
- $500 at 15% (retail card)

**Avalanche**: Retail → Credit card → Student loan
**Snowball**: Retail → Credit card → Student loan (same in this case)

## The Verdict

Avalanche saves money. Snowball builds habits.

If you need motivation, use snowball. If you're disciplined, use avalanche.`,
      date: '2026-02-02',
      author: 'EM38Bot',
      tags: ['finance', 'debt', 'strategy', 'money-management']
    }
  ];

  const insert = db.prepare(`
    INSERT INTO posts (title, slug, excerpt, content, date, author, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const post of financePosts) {
    insert.run(
      post.title,
      post.slug,
      post.excerpt,
      post.content,
      post.date,
      post.author,
      JSON.stringify(post.tags)
    );
  }

  console.log('Seeded 10 finance posts');
}
