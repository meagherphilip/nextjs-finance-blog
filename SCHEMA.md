# Database Schema Documentation

## Overview
SQLite database with 5 main tables storing all application data.

---

## Table: `users`

**Purpose:** Store user accounts and authentication info

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID unique identifier |
| email | TEXT | UNIQUE, NOT NULL | User email address (login) |
| name | TEXT | | Display name |
| image | TEXT | | Profile image URL |
| password_hash | TEXT | | bcrypt hashed password |
| role | TEXT | DEFAULT 'editor' | User role: admin/editor/reader |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- UNIQUE on `email`

**Sample Data:**
```sql
INSERT INTO users (id, email, name, password_hash, role) 
VALUES ('uuid', 'admin@example.com', 'Admin', '$2b$10$...', 'admin');
```

---

## Table: `themes`

**Purpose:** Content themes and categories for blog organization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID unique identifier |
| name | TEXT | NOT NULL | Theme name |
| slug | TEXT | UNIQUE, NOT NULL | URL-friendly identifier |
| description | TEXT | | Theme description |
| keywords | TEXT | | Comma-separated keywords |
| tone | TEXT | DEFAULT 'professional' | Default writing tone |
| target_audience | TEXT | | Intended audience |
| settings | TEXT | | JSON string of generation settings |
| created_by | TEXT | FOREIGN KEY users(id) | Creator user ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Indexes:**
- UNIQUE on `slug`
- INDEX on `created_by`

---

## Table: `blogs`

**Purpose:** Store generated blog content and metadata

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID unique identifier |
| title | TEXT | NOT NULL | Blog title |
| slug | TEXT | UNIQUE, NOT NULL | URL-friendly identifier |
| excerpt | TEXT | | SEO meta description (150-160 chars) |
| content | TEXT | | Full blog content (markdown) |
| status | TEXT | DEFAULT 'draft' | draft/generating/published |
| author_id | TEXT | FOREIGN KEY users(id) | Author user ID |
| theme_id | TEXT | FOREIGN KEY themes(id) | Associated theme |
| seo_title | TEXT | | SEO optimized title |
| seo_description | TEXT | | SEO meta description |
| keywords | TEXT | | Comma-separated keywords |
| featured_image | TEXT | | URL to featured image |
| images | TEXT | | JSON array of image URLs |
| sources | TEXT | | JSON array of cited sources |
| calculations | TEXT | | JSON array of calculator data |
| word_count | INTEGER | | Total word count |
| reading_time | INTEGER | | Estimated reading time (minutes) |
| generated_by | TEXT | | Generation job ID |
| published_at | DATETIME | | Publication date |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation time |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- UNIQUE on `slug`
- INDEX on `author_id`
- INDEX on `theme_id`
- INDEX on `status`
- INDEX on `created_at`

**Relationships:**
- `author_id` → users.id
- `theme_id` → themes.id

---

## Table: `generations`

**Purpose:** Track AI generation jobs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID unique identifier |
| blog_id | TEXT | FOREIGN KEY blogs(id) | Associated blog |
| theme_id | TEXT | FOREIGN KEY themes(id) | Associated theme |
| prompt | TEXT | NOT NULL | Original generation prompt |
| model | TEXT | | AI model used |
| status | TEXT | DEFAULT 'pending' | pending/researching/outlining/writing/completed/failed |
| output | TEXT | | Generated blog ID (on completion) |
| cost | REAL | | Estimated API cost |
| tokens_used | INTEGER | | Total tokens consumed |
| error | TEXT | | Error message (if failed) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Start time |
| completed_at | DATETIME | | Completion time |

**Indexes:**
- INDEX on `blog_id`
- INDEX on `theme_id`
- INDEX on `status`
- INDEX on `created_at`

**Relationships:**
- `blog_id` → blogs.id
- `theme_id` → themes.id

---

## Table: `research`

**Purpose:** Store web search results for citations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | UUID unique identifier |
| query | TEXT | NOT NULL | Search query used |
| topic | TEXT | NOT NULL | Related topic |
| sources | TEXT | | JSON array of sources with metadata |
| key_stats | TEXT | | JSON array of extracted statistics |
| quotes | TEXT | | JSON array of expert quotes |
| summary | TEXT | | AI-generated summary of research |
| credibility_score | REAL | | Average credibility of sources (0-1) |
| used_in | TEXT | | JSON array of blog IDs that used this research |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Research time |
| expires_at | DATETIME | | Expiration date (30 days default) |

**Indexes:**
- INDEX on `topic`
- INDEX on `created_at`
- INDEX on `expires_at`

**Source Object Structure:**
```json
{
  "title": "Article Title",
  "url": "https://example.com/article",
  "description": "Article description",
  "age": "2 weeks ago",
  "credibility": 0.9
}
```

---

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │     │    themes   │     │   research  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │────<│ created_by  │     │ id (PK)     │
│ email       │     │ id (PK)     │────<│ used_in[]   │
│ name        │     │ name        │     │ topic       │
│ role        │     │ slug        │     │ sources     │
└─────────────┘     └─────────────┘     └─────────────┘
        │                   │                   │
        │                   │                   │
        │            ┌──────┴──────┐           │
        │            │    blogs    │<──────────┘
        │            ├─────────────┤
        └───────────<│ author_id   │
                     │ theme_id    │<──────────┐
                     │ id (PK)     │           │
                     │ title       │     ┌─────┴───────┐
                     │ content     │     │ generations │
                     │ status      │     ├─────────────┤
                     │ sources     │     │ id (PK)     │
                     │ word_count  │     │ blog_id     │>────┘
                     └─────────────┘     │ theme_id    │>────┘
                                          │ status      │
                                          │ prompt      │
                                          └─────────────┘
```

---

## SQL Schema (Complete)

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'editor',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Themes table
CREATE TABLE themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  keywords TEXT,
  tone TEXT DEFAULT 'professional',
  target_audience TEXT,
  settings TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Blogs table
CREATE TABLE blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft',
  author_id TEXT,
  theme_id TEXT,
  seo_title TEXT,
  seo_description TEXT,
  keywords TEXT,
  featured_image TEXT,
  images TEXT,
  sources TEXT,
  calculations TEXT,
  word_count INTEGER,
  reading_time INTEGER,
  generated_by TEXT,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (theme_id) REFERENCES themes(id)
);

-- Generations table
CREATE TABLE generations (
  id TEXT PRIMARY KEY,
  blog_id TEXT,
  theme_id TEXT,
  prompt TEXT NOT NULL,
  model TEXT,
  status TEXT DEFAULT 'pending',
  output TEXT,
  cost REAL,
  tokens_used INTEGER,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (blog_id) REFERENCES blogs(id),
  FOREIGN KEY (theme_id) REFERENCES themes(id)
);

-- Research table
CREATE TABLE research (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  topic TEXT NOT NULL,
  sources TEXT,
  key_stats TEXT,
  quotes TEXT,
  summary TEXT,
  credibility_score REAL,
  used_in TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_themes_slug ON themes(slug);
CREATE INDEX idx_themes_created_by ON themes(created_by);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_author ON blogs(author_id);
CREATE INDEX idx_blogs_theme ON blogs(theme_id);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_created ON blogs(created_at);
CREATE INDEX idx_generations_blog ON generations(blog_id);
CREATE INDEX idx_generations_status ON generations(status);
CREATE INDEX idx_research_topic ON research(topic);
CREATE INDEX idx_research_expires ON research(expires_at);
```

---

## Data Flow

### Blog Generation Flow:
1. **Generation Request**
   - Create entry in `generations` table with status='pending'
   
2. **Research Phase** (if enabled)
   - Search Brave API
   - Store results in `research` table
   - Link to generation via topic
   
3. **Outline Phase**
   - AI generates structure
   - Update `generations.status` = 'outlining'
   
4. **Writing Phase**
   - Create entry in `blogs` table with status='generating'
   - Generate content section by section
   - Update `generations.status` = 'writing'
   
5. **Completion**
   - Update `blogs.status` = 'draft'
   - Update `generations.status` = 'completed'
   - Update `generations.output` = blogs.id
   - Link research to blog via `research.used_in`

### Data Storage Examples:

**Blog with Research:**
```sql
-- Blog record
{
  "id": "blog-uuid",
  "title": "How to Build an Emergency Fund",
  "content": "# Full markdown content...",
  "sources": "[\"https://bankrate.com/...\", \"https://federalreserve.gov/...\"]",
  "word_count": 2150,
  "reading_time": 11,
  "status": "published"
}

-- Associated research
{
  "id": "research-uuid",
  "query": "emergency fund statistics 2024",
  "sources": "[{\"title\": \"Bankrate Report\", \"url\": \"...\", \"credibility\": 0.9}]",
  "key_stats": "[\"60% used savings for essentials\", \"27% have no emergency fund\"]",
  "used_in": "[\"blog-uuid\"]"
}
```

---

## Backup & Maintenance

### Recommended Backups:
- **Daily:** `data/app.db` file
- **Weekly:** Full `data/` directory

### Cleanup Tasks:
```sql
-- Remove expired research (older than 30 days)
DELETE FROM research WHERE expires_at < datetime('now');

-- Archive old generations (keep last 90 days)
DELETE FROM generations 
WHERE status = 'completed' 
AND created_at < datetime('now', '-90 days');
```

### Database Size Monitoring:
```sql
-- Check table sizes
SELECT 
  name,
  (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=tables.name) as row_count,
  (SELECT page_count * page_size FROM pragma_page_count(), pragma_page_size()) as size_bytes
FROM sqlite_master tables WHERE type='table';
```

---

## Migration History

### v1.0 - Initial Schema
- Created: users, themes, blogs, generations tables

### v1.1 - Research Feature
- Added: research table
- Added: blogs.sources, blogs.reading_time columns

### v1.2 - Quality Tracking
- Added: generations.tokens_used, generations.cost
- Added: blogs.seo_title, blogs.seo_description
