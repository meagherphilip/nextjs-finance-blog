# Project Architecture: AI Blog Generator

## Goal
Build a Machined.ai-style autonomous blog platform with AI generation, web search, and image integration.

## Tech Stack

### Core
- **Frontend:** Next.js 16, TypeScript, Tailwind
- **Auth:** NextAuth.js v5 (Auth.js)
- **Database:** SQLite (local), Postgres (production)
- **AI:** OpenRouter API (Kimi 2.5, GPT-4, Claude)
- **Search:** Brave Search API
- **Images:** Unsplash API (stock), DALL-E (generated)

### Features

#### Phase 1: Foundation
- [x] Project setup
- [ ] Authentication (NextAuth)
- [ ] Database schema (Users, Blogs, Themes, Generations)
- [ ] AI generation endpoint
- [ ] Basic UI for blog creation

#### Phase 2: Intelligence
- [ ] Web search integration
- [ ] Image sourcing/generation
- [ ] Outline → Full content pipeline
- [ ] SEO auto-optimization

#### Phase 3: Platform
- [ ] Theme collections
- [ ] Editorial workflow
- [ ] Scheduling system
- [ ] Analytics

## Database Schema

### Users
- id, email, name, image, role (admin/editor/reader)

### Blogs
- id, title, slug, content, excerpt, status (draft/published)
- authorId, themeId, metadata (seo, images, sources)
- createdAt, updatedAt, publishedAt

### Themes
- id, name, description, keywords, tone, targetAudience
- generationSettings (length, style, frequency)

### Generations
- id, blogId, prompt, model, status, output, cost

## AI Pipeline

1. **Research Phase**
   - User provides topic/theme
   - Web search for current info, stats, trends
   - Extract key points and sources

2. **Outline Phase**
   - Generate H2/H3 structure
   - Determine word count (1,500-3,000 words)
   - Plan image placements

3. **Writing Phase**
   - Generate section by section
   - Include data, quotes, examples
   - Maintain consistent tone

4. **Enhancement Phase**
   - Add images (search or generate)
   - Optimize for SEO
   - Add internal/external links

5. **Review Phase**
   - Present to user
   - Allow editing/regeneration
   - Publish or schedule

## API Keys Needed

- OPENROUTER_API_KEY (AI generation)
- BRAVE_API_KEY (web search)
- UNSPLASH_ACCESS_KEY (stock images)
- OPENAI_API_KEY (DALL-E image generation)

## Notes

- Start with OpenRouter (already configured)
- Use Brave for search (free tier: 2,000 queries/month)
- Unsplash for free stock photos
- Consider upgrading to paid plans for production
