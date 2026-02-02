# AI Blog Generation System

## Current Implementation Status

### ✅ Phase 1: Foundation (COMPLETE)
- Authentication system
- Database schema
- Basic generation pipeline
- Dashboard UI

### 🔄 Phase 2: Research Engine (IN PROGRESS)
- Web search integration (Brave API) - PENDING
- Research storage and recording - PENDING
- Source citation system - PENDING

### 🔄 Phase 3: Advanced Writing (PARTIAL)
- Multi-stage generation ✅
- Variable length control ✅
- First-person voice - PENDING
- Anti-AI detection - PENDING

### ⏳ Phase 4-7: Not Started
- Calculations & data
- Theme collections
- Media integration
- Cron automation

---

## How to Create a Blog (Current Process)

### Manual Creation via Dashboard

1. **Login**
   - URL: http://localhost:3000/login
   - Default: admin@example.com / admin123

2. **Navigate to Dashboard**
   - Click "Generate Blog" tab

3. **Fill Generation Form**
   ```
   Topic: "How to Build an Emergency Fund"
   Keywords: emergency fund, savings, personal finance
   Tone: professional (conversational, enthusiastic, authoritative)
   Target Length: medium (~2,000 words) [short: 1,000 | medium: 2,000 | long: 3,000]
   ```

4. **Submit**
   - Click "Generate Blog"
   - Wait 2-5 minutes (AI writes section by section)

5. **Review**
   - Navigate to "My Blogs" tab
   - Click on generated blog to view
   - Edit if needed (future feature)

6. **Publish**
   - Change status from "draft" to "published" (future feature)

---

## Generation Pipeline (Current)

```
1. OUTLINE PHASE (30 seconds)
   └── AI generates structure:
       - Title
       - Slug
       - Excerpt
       - H2/H3 sections
       - Key points to cover

2. DRAFT CREATION
   └── Blog record created in database
   └── Status: "generating"

3. SECTION WRITING (2-4 minutes)
   └── For each section in outline:
       └── Generate 300-500 words
       └── Include examples and data
       └── Add keyword integration

4. INTRODUCTION (30 seconds)
   └── 200-300 word hook
   └── Preview key points

5. CONCLUSION (30 seconds)
   └── 150-200 word summary
   └── Call-to-action

6. ASSEMBLY
   └── Combine all sections
   └── Calculate word count
   └── Calculate reading time
   └── Update database
   └── Status: "draft"
```

**Total Time:** 3-6 minutes for 2,000 words

---

## Research & Quality Standards

### Current Limitations
- ❌ No web research (Phase 2)
- ❌ No source citations (Phase 2)
- ❌ No research storage (Phase 2)
- ⚠️ Generic third-person voice (Phase 3)
- ⚠️ May trigger AI detection (Phase 3)

### Planned Improvements

#### Phase 2: Research Engine
```javascript
// Research will be stored in database
research: {
  query: "emergency fund statistics 2024",
  sources: [
    { url: "https://...", title: "...", credibility: 0.9 },
    { url: "https://...", title: "...", credibility: 0.8 }
  ],
  key_stats: [
    "60% of Americans can't cover $1,000 emergency"
  ],
  quotes: [
    { text: "...", author: "...", source: "..." }
  ],
  used_in: [blog_id],
  created_at: timestamp
}
```

#### Phase 3: Quality Writing
```javascript
// Voice options
voice: {
  persona: "expert", // expert | experienced | curious | skeptical
  tone: "conversational", // professional | conversational | friendly
  perspective: "first-person", // I, me, my, mine
  opinion_level: "high", // expresses preferences, takes stances
}

// Anti-AI detection
anti_detection: {
  perplexity_variation: true,
  sentence_burstiness: true, // mix short/long sentences
  personal_anecdotes: true,
  idiomatic_expressions: true,
  imperfections: true, // fragments, rhetorical questions
}
```

#### Quality Checklist (Target)
- [ ] 2,000-3,000 words
- [ ] 5+ authoritative sources cited
- [ ] First-person perspective
- [ ] Personal opinions expressed
- [ ] Data and statistics included
- [ ] Passes AI detection (<30% probability)
- [ ] Flesch-Kincaid 50-70 (8th-10th grade)
- [ ] Engaging hook in first 100 words
- [ ] Clear call-to-action

---

## AI Models Used

### Current
- **Primary:** Kimi 2.5 (Moonshot AI) via OpenRouter
  - Model ID: `openrouter/moonshotai/kimi-k2.5`
  - Context: 256K tokens
  - Strength: Long-form content, reasoning
  - Cost: ~$0.003/1K tokens

### Planned Additions
- **Research:** GPT-4 via OpenRouter (web search capabilities)
- **Short content:** Claude Haiku (faster, cheaper)
- **Images:** DALL-E 3 (featured images)
- **SEO:** GPT-4 (meta optimization)

---

## Cron Job Automation (Phase 7)

### Planned Implementation

```yaml
# Cron jobs for autonomous publishing

daily-content-generation:
  schedule: "0 9 * * *"  # 9 AM daily
  action: Generate 1-3 blogs from topic queue
  
weekly-theme-batch:
  schedule: "0 10 * * 1"  # Monday 10 AM
  action: Generate 5-10 article series on theme
  
content-refresh:
  schedule: "0 2 * * 0"  # Sunday 2 AM
  action: Update outdated articles with new data
  
social-promotion:
  schedule: "0 12,18 * * *"  # 12 PM, 6 PM daily
  action: Auto-post to Twitter/LinkedIn
```

### Autonomous Workflow
```
1. SCHEDULER TRIGGER
   └── Cron job fires

2. TOPIC SELECTION
   └── Check theme queue
   └── Check trending topics
   └── Select highest priority

3. RESEARCH PHASE
   └── Web search for current data
   └── Extract statistics
   └── Find expert quotes
   └── Store research in database

4. GENERATION
   └── Create outline
   └── Write sections
   └── Add citations
   └── Optimize for SEO

5. QUALITY CHECK
   └── Word count: 2,000-3,000?
   └── Sources: 5+ cited?
   └── AI detection: <30%?
   └── Grammar check

6. PUBLISH OR QUEUE
   └── If quality passes → Publish
   └── If needs review → Draft status
   └── If fails → Regenerate

7. PROMOTION
   └── Generate social media posts
   └── Schedule tweets/threads
   └── Update newsletter
```

---

## Database Schema for Research

```sql
-- Research cache table
CREATE TABLE research (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  topic TEXT NOT NULL,
  sources TEXT, -- JSON array of sources
  key_stats TEXT, -- JSON array
  quotes TEXT, -- JSON array
  summary TEXT,
  credibility_score REAL,
  used_in TEXT, -- JSON array of blog IDs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME -- Research freshness
);

-- Source library
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  domain TEXT,
  author TEXT,
  publish_date TEXT,
  credibility_score REAL,
  content_type TEXT, -- article | study | news | blog
  use_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Writing Standards Document

### Structure Requirements
1. **Title:** 50-60 characters, compelling, includes keyword
2. **Excerpt:** 150-160 characters, hook + value proposition
3. **Introduction:** 200-300 words
   - Hook (problem, question, stat)
   - Promise (what reader will learn)
   - Credibility (why trust this source)
   - Roadmap (preview sections)

4. **Body Sections:** 300-500 words each
   - H2 for main sections
   - H3 for subsections
   - Data/statistics every 300 words
   - Examples and case studies
   - Transition to next section

5. **Conclusion:** 150-200 words
   - Summary of key points
   - Key takeaway emphasized
   - Call-to-action
   - Engagement question

### Voice Guidelines
- Use "I" and "my" (first person)
- Contractions (don't, can't, won't)
- Colloquial expressions ("Look, I get it...")
- Imperfections allowed (fragments, rhetorical questions)
- Enthusiasm and personality
- Opinions and preferences stated clearly

### Anti-AI Markers
```
✓ Variable sentence length (5 words → 50 words)
✓ Personal anecdotes ("When I started investing...")
✓ Cultural references
✓ Self-correction ("Actually, let me rephrase...")
✓ Transitional phrases ("But here's the thing...")
✓ Contradictions and nuance
✓ Imperfections ("Kind of", "sort of")
```

---

## Next Steps

### Immediate (This Week)
1. ✅ Fix auth and database (DONE)
2. ✅ Add testing suite (DONE)
3. 🔄 Add Brave Search API integration
4. 🔄 Implement research storage
5. 🔄 Update prompts for first-person voice

### Short Term (Next 2 Weeks)
1. Anti-AI detection features
2. Source citation system
3. Quality scoring algorithm
4. Cron job setup for GitHub Actions

### Long Term (Phase 4-7)
1. Interactive calculators
2. Theme collections
3. Auto-publishing
4. Social media automation

---

## API Keys Needed

```bash
# Already configured
OPENROUTER_API_KEY=sk-or-v1-...

# Needed for Phase 2
BRAVE_API_KEY=BA...

# Needed for Phase 6
UNSPLASH_ACCESS_KEY=...
OPENAI_API_KEY=sk-...
```
