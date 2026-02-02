# Finance & Investing Blog

A modern blog built with Next.js, TypeScript, SQLite, and Tailwind CSS. Features 10 SEO-optimized finance articles with structured data for search engines and AI crawlers.

## Features

- 🚀 **Next.js 16** with App Router
- 📊 **SQLite Database** for content management
- 🎨 **Tailwind CSS** for styling
- 🔍 **SEO Optimized**:
  - Dynamic meta tags for each post
  - Open Graph tags for social sharing
  - JSON-LD structured data (Schema.org)
  - Auto-generated sitemap.xml
  - robots.txt for crawler guidance
- 📝 **10 Finance Articles** covering investing, budgeting, retirement, and more
- 🔄 **REST API** for posts

## Tech Stack

- Next.js 16
- TypeScript
- SQLite (better-sqlite3)
- Tailwind CSS
- Node.js 23+

## Getting Started

```bash
# Install dependencies
npm install

# Seed the database with finance posts
npm run seed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the blog.

## API Endpoints

- `GET /api/posts` - List all posts
- `GET /api/posts/[slug]` - Get specific post
- `POST /api/seed` - Reseed database

## SEO Configuration

Before deploying, update these files with your actual domain:

1. `src/lib/metadata.ts` - Change `yourdomain.com` to your actual domain
2. `src/lib/schema.ts` - Change `yourdomain.com` to your actual domain
3. `src/app/sitemap.ts` - Change `yourdomain.com` to your actual domain
4. `src/app/robots.ts` - Change `yourdomain.com` to your actual domain
5. `src/app/layout.tsx` - Update Google Search Console verification code

## Deployment

The app outputs to standalone mode for easy deployment on:
- Vercel
- Railway
- DigitalOcean App Platform
- Any Docker host

```bash
# Build for production
npm run build
```

## Content

All 10 articles focus on personal finance and investing:

1. Understanding Compound Interest
2. Building an Emergency Fund
3. Index Funds vs Individual Stocks
4. The 50/30/20 Budget Rule
5. IRA vs 401(k) Explained
6. Credit Scores Demystified
7. Dollar-Cost Averaging
8. The FIRE Movement
9. Understanding Inflation
10. Debt Avalanche vs Snowball

---

Built with 🔧 by EM38Bot
