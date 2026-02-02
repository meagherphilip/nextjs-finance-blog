# Product Requirements Document (PRD)
# AI Blog Generator Platform

## Executive Summary

Build an autonomous AI-powered blog generation platform that creates high-quality, research-backed, long-form content (2,000-3,000 words) that reads as human-written first-person narratives. The system will conduct real-time research, include data-driven calculations, and produce genuinely valuable content indistinguishable from expert human writers.

---

## Product Vision

**Mission:** Create an AI platform that doesn't just generate content—it conducts research, performs analysis, and writes authoritative articles that provide genuine value to readers while maintaining a distinct human voice.

**Differentiation:** Unlike generic AI writers, this platform:
- Conducts live web research for every article
- Includes real calculations and data analysis
- Writes in first-person with personality and opinion
- Creates content that passes AI detection
- Generates comprehensive 2,000-3,000 word pieces
- Builds thematic content collections

---

## Target Users

1. **Solo Content Creators** — Build authority blogs without writing
2. **Marketing Teams** — Scale content production with quality
3. **Niche Site Builders** — Create topical authority sites
4. **Thought Leaders** — Generate research-backed thought leadership
5. **SEO Professionals** — Create search-optimized comprehensive content

---

## Core Features & Requirements

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Basic platform with authentication and simple generation

#### Features:
1. **User Authentication**
   - Email/password login
   - Role-based access (admin/editor)
   - Session management

2. **Basic Blog Generation**
   - Topic input
   - Single AI call generation
   - 500-800 word output
   - Markdown formatting

3. **Content Management**
   - Draft/Published status
   - Basic editing interface
   - Slug generation

4. **Database Schema**
   - Users, Blogs, Themes tables
   - Generation history tracking

#### Success Criteria:
- User can log in and generate a basic blog
- Content saves to database
- Can view and edit generated content

---

### Phase 2: Research Engine (Weeks 3-4)
**Goal:** Add real-time research capabilities

#### Features:
1. **Web Search Integration**
   - Brave Search API integration
   - 10-15 relevant sources per article
   - Source credibility scoring
   - Automatic citation insertion

2. **Research Summarization**
   - Extract key statistics
   - Identify expert quotes
   - Find recent developments
   - Compile data points

3. **Research Storage**
   - Save research per generation
   - Reusable research across articles
   - Source library building

#### Success Criteria:
- Generated blogs include 5+ cited sources
- Research happens automatically pre-writing
- Sources are authoritative (news, .edu, .gov, established blogs)

---

### Phase 3: Advanced Writing Engine (Weeks 5-6)
**Goal:** Long-form, human-like content with personality

#### Features:
1. **Multi-Stage Generation Pipeline**
   ```
   Research → Outline → Introduction → Sections → Conclusion → Edit
   ```

2. **First-Person Voice Options**
   - Persona selection (Expert, Experienced, Curious, Skeptical)
   - Tone calibration (Conversational, Authoritative, Friendly)
   - Opinion injection (takes stances, expresses preferences)

3. **Variable Length Control**
   - Short: 800-1,200 words (quick guides)
   - Medium: 1,500-2,000 words (standard articles)
   - Long: 2,500-3,500 words (comprehensive guides)
   - Epic: 4,000+ words (pillar content)

4. **Anti-AI Detection**
   - Perplexity variation
   - Burstiness in sentence structure
   - Personal anecdotes injection
   - Idiomatic expressions
   - Imperfections (occasional fragments, rhetorical questions)

5. **Content Elements**
   - Compelling hooks
   - Storytelling arcs
   - Counter-arguments
   - Personal opinions
   - Calls to action
   - Reader engagement questions

#### Success Criteria:
- Passes AI detection tools ( originality.ai, GPTZero)
- Reads as genuine first-person perspective
- 2,000+ word outputs consistently
- Includes opinions and personality

---

### Phase 4: Calculations & Data (Weeks 7-8)
**Goal:** Include interactive calculations and data analysis

#### Features:
1. **Embedded Calculators**
   - Compound interest calculator
   - ROI calculator
   - Savings rate calculator
   - Mortgage/rent vs buy calculator
   - FIRE number calculator

2. **Data Visualizations**
   - Auto-generated charts
   - Comparison tables
   - Progress trackers
   - Scenario comparisons

3. **Real-Time Data Integration**
   - Stock prices (via Yahoo Finance API)
   - Interest rates
   - Inflation data
   - Market indices

4. **Example Scenarios**
   - "What if you invested $500/month starting at 25?"
   - "Compare 6% vs 8% returns over 30 years"
   - "Cost of waiting 5 years to invest"

#### Success Criteria:
- Articles include 2-3 interactive calculators
- Real data is current (within 24 hours)
- Calculations are accurate and cited
- Visual elements enhance understanding

---

### Phase 5: Theme Collections (Weeks 9-10)
**Goal:** Build topical authority through series

#### Features:
1. **Theme Management**
   - Create content themes (e.g., "FIRE Movement", "Debt Freedom")
   - Define theme parameters (tone, audience, keywords)
   - Auto-suggest related topics

2. **Series Generation**
   - Generate 5-10 article series on a theme
   - Internal linking between articles
   - Progressive complexity (beginner → advanced)
   - Content calendar scheduling

3. **Topical Authority Building**
   - Cover all aspects of a topic
   - Cornerstone/pillar content strategy
   - Supporting article clusters
   - Auto-generated hub pages

4. **Content Variety Within Themes**
   - "How to" guides
   - "Mistakes to avoid" warnings
   - "Case studies" and examples
   - "Deep dive" explainers
   - "Latest trends" updates

#### Success Criteria:
- Can create 10-article series with one click
- Articles interlink naturally
- Complete topic coverage
- Hub page auto-generates with series

---

### Phase 6: Media & Enhancement (Weeks 11-12)
**Goal:** Rich media integration

#### Features:
1. **Image Integration**
   - Unsplash API for stock photos
   - AI image generation (DALL-E/Stable Diffusion)
   - Chart/image placement optimization
   - Alt text generation

2. **Video Scripts**
   - Generate YouTube video scripts from articles
   - Timestamp suggestions
   - Visual direction notes

3. **Social Media Assets**
   - Twitter thread generation
   - LinkedIn post variants
   - Instagram caption creation

4. **SEO Optimization**
   - Automatic keyword research
   - Meta title/description generation
   - Header tag optimization
   - Internal linking suggestions

#### Success Criteria:
- Each article has 3-5 relevant images
- Social variants generated automatically
- SEO score 90+ on clearscope/surfer

---

### Phase 7: Automation & Scheduling (Weeks 13-14)
**Goal:** Autopilot content creation

#### Features:
1. **Scheduled Generation**
   - Queue up topics in advance
   - Auto-publish on schedule
   - Content calendar view

2. **Trend-Based Auto-Generation**
   - Monitor Google Trends
   - Auto-generate content on trending topics in niche
   - News-reactive content creation

3. **Content Refresh**
   - Identify outdated articles
   - Auto-update with new data
   - Republish with "Updated" label

4. **Email Newsletter**
   - Auto-compile weekly digest
   - Subscriber management
   - SendGrid/Mailgun integration

#### Success Criteria:
- Can schedule 30 days of content
- Auto-publishes without intervention
- Newsletter sends automatically

---

## Technical Architecture

### Stack
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, SQLite (local), PostgreSQL (production)
- **Auth:** NextAuth.js
- **AI:** OpenRouter (Kimi 2.5, GPT-4, Claude access)
- **Search:** Brave Search API
- **Images:** Unsplash API, DALL-E API
- **Data:** Yahoo Finance API, FRED API (economic data)
- **Hosting:** Vercel (frontend), Railway/Render (backend + DB)

### Database Schema

```sql
-- Users
users (id, email, name, password_hash, role, created_at)

-- Themes/Collections
themes (id, name, slug, description, keywords, tone, target_audience, 
        settings, content_strategy, created_by, created_at)

-- Blogs
blogs (id, title, slug, excerpt, content, status, author_id, theme_id,
       seo_title, seo_description, keywords, featured_image, images,
       sources, calculations, word_count, reading_time, generated_by,
       ai_detect_score, published_at, created_at, updated_at)

-- Research Cache
research (id, query, sources, summary, data_points, created_at, expires_at)

-- Generations
generations (id, blog_id, theme_id, prompt, model, status, output, 
             cost, tokens_used, research_used, error, created_at, completed_at)

-- Scheduled Content
scheduled_content (id, blog_id, scheduled_for, status, published_at)

-- Media Library
media (id, type, url, alt_text, source, generated_by, created_at)
```

### AI Pipeline Flow

```
1. USER INPUT
   └── Topic, theme, length, tone preferences

2. RESEARCH PHASE (2-3 min)
   ├── Web search (10-15 queries)
   ├── Extract key data points
   ├── Find statistics and quotes
   ├── Compile source list
   └── Store research cache

3. OUTLINE PHASE (30 sec)
   ├── Generate H2/H3 structure
   ├── Plan word count per section
   ├── Identify calculator opportunities
   └── Determine image placement

4. WRITING PHASE (5-8 min)
   ├── Generate hook/intro (200-300 words)
   ├── For each section:
   │   ├── Write content (300-500 words)
   │   ├── Include research citations
   │   ├── Add personal opinion
   │   └── Insert relevant data
   ├── Generate conclusion (150-200 words)
   └── Add CTAs and engagement

5. ENHANCEMENT PHASE (1 min)
   ├── Add markdown formatting
   ├── Insert calculator placeholders
   ├── Optimize for readability
   ├── Check AI detection score
   └── Final edit pass

6. OUTPUT
   └── Full article + metadata + sources
```

---

## Quality Standards

### Content Requirements
- **Length:** 2,000-3,000 words (default), 800-5,000 (range)
- **Research:** Minimum 5 authoritative sources cited
- **Calculations:** 2-3 interactive calculators per financial article
- **Images:** 3-5 relevant images with alt text
- **Originality:** <30% AI detection probability
- **Readability:** Flesch-Kincaid 50-70 (8th-10th grade)
- **SEO:** Target keyword density 1-2%, LSI keywords included

### Voice & Tone Standards
- First-person singular (I, me, my, mine)
- Conversational but knowledgeable
- Occasional informality (contractions, colloquialisms)
- Personal opinions and preferences stated
- Imperfections allowed (sentence fragments, rhetorical questions)
- Enthusiasm and personality

### Anti-AI Markers
- Variable sentence length (short punchy + long complex)
- Personal anecdotes and examples
- Transitional phrases ("But here's the thing...", "Look, I get it...")
- Imperfections ("Kind of", "sort of", "you know?")
- Cultural references
- Opinions and bias
- Self-correction ("Actually, let me rephrase...")

---

## Monetization Strategy

### Pricing Tiers

**Free (Hobby)**
- 3 generations/month
- 1,000 words max
- Basic research
- Community support

**Starter ($29/month)**
- 20 generations/month
- 2,500 words max
- Full research
- Email support

**Professional ($79/month)**
- 50 generations/month
- 5,000 words max
- Priority research
- Theme collections
- API access
- Chat support

**Agency ($199/month)**
- Unlimited generations
- Unlimited length
- White-label option
- Team collaboration
- Dedicated support
- Custom integrations

---

## Competitive Analysis

| Feature | Machined.ai | Jasper | Our Platform |
|---------|-------------|---------|--------------|
| Research | ❌ | ❌ | ✅ Live web |
| Length | 2,000+ words | Variable | 2,000-3,500 |
| Human voice | ⚠️ | ⚠️ | ✅ First-person |
| Calculations | ❌ | ❌ | ✅ Interactive |
| AI Detection | ❌ | ❌ | ✅ Anti-detection |
| Themes | ✅ | ❌ | ✅ Advanced |
| Real-time data | ❌ | ❌ | ✅ Live APIs |
| Price | $49/mo | $49/mo | $29-79/mo |

---

## Success Metrics

### Technical KPIs
- Generation success rate: >95%
- Average generation time: <10 minutes
- Uptime: 99.9%
- API response time: <2 seconds

### Content KPIs
- AI detection pass rate: >80%
- Average word count: 2,200+
- Sources per article: 5+
- User satisfaction: >4.5/5

### Business KPIs
- Monthly active users: 1,000 (Year 1)
- Paid conversion rate: 5%
- Churn rate: <5%/month
- LTV:CAC ratio: >3:1

---

## Risk Mitigation

### Technical Risks
- **AI API downtime:** Multi-provider fallback (OpenRouter)
- **Rate limiting:** Queue system with retries
- **Data loss:** Daily backups, version control

### Content Risks
- **AI detection:** Continuous model refinement
- **Factual errors:** Source verification layer
- **Copyright:** Original content generation only

### Business Risks
- **Competition:** Continuous innovation, unique features
- **AI regulation:** Transparency about AI usage
- **Cost increases:** Efficient token usage, caching

---

## Implementation Timeline

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| 1. Foundation | 2 weeks | Working prototype |
| 2. Research | 2 weeks | Research engine |
| 3. Writing | 2 weeks | Long-form content |
| 4. Calculations | 2 weeks | Interactive elements |
| 5. Themes | 2 weeks | Collection system |
| 6. Media | 2 weeks | Rich content |
| 7. Automation | 2 weeks | Autopilot mode |
| **Total** | **14 weeks** | **Full platform** |

---

## Next Steps

1. **Approve PRD** — Review and finalize requirements
2. **Phase 1 Kickoff** — Begin foundation build
3. **API Keys** — Set up OpenRouter, Brave Search
4. **Design Mockups** — UI/UX for dashboard
5. **Weekly Sprints** — Agile development cycles

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-02  
**Author:** EM38Bot  
**Status:** Draft — Pending Approval
