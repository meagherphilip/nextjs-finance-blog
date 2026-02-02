import Database from 'better-sqlite3';
import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = process.env.DATABASE_URL || './data/app.db';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDb();
  }
  return db;
}

function initDb() {
  if (!db) return;
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      password_hash TEXT,
      role TEXT DEFAULT 'editor',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Themes/Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS themes (
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
    )
  `);
  
  // Blogs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blogs (
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
      word_count INTEGER,
      reading_time INTEGER,
      generated_by TEXT,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id),
      FOREIGN KEY (theme_id) REFERENCES themes(id)
    )
  `);
  
  // Generations table (AI generation jobs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      blog_id TEXT,
      theme_id TEXT,
      prompt TEXT,
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
    )
  `);

  // Research table (stores web search results)
  db.exec(`
    CREATE TABLE IF NOT EXISTS research (
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
    )
  `);
  
  // Insert default admin user (password: admin123)
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com');
  if (!adminExists) {
    // Use synchronous hash
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), 'admin@example.com', 'Admin', hashedPassword, 'admin');
    console.log('Created default admin user: admin@example.com / admin123');
  }
}

// User functions
export function createUser(email: string, name: string, password: string) {
  const db = getDb();
  const id = uuidv4();
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  try {
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(id, email, name, hashedPassword);
    return { id, email, name };
  } catch (error) {
    throw new Error('User already exists');
  }
}

export function validateUser(email: string, password: string) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  
  if (!user) return null;
  
  const bcrypt = require('bcryptjs');
  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role
  };
}

export function getUserById(id: string) {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, image, role FROM users WHERE id = ?').get(id) as any;
  return user || null;
}

// Theme functions
export function createTheme(data: {
  name: string;
  slug: string;
  description?: string;
  keywords?: string[];
  tone?: string;
  targetAudience?: string;
  settings?: object;
  createdBy: string;
}) {
  const db = getDb();
  const id = uuidv4();
  
  db.prepare(`
    INSERT INTO themes (id, name, slug, description, keywords, tone, target_audience, settings, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.slug,
    data.description || null,
    data.keywords?.join(',') || null,
    data.tone || 'professional',
    data.targetAudience || null,
    data.settings ? JSON.stringify(data.settings) : null,
    data.createdBy
  );
  
  return getThemeById(id);
}

export function getThemeById(id: string) {
  const db = getDb();
  const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(id) as any;
  if (theme) {
    theme.keywords = theme.keywords?.split(',') || [];
    theme.settings = theme.settings ? JSON.parse(theme.settings) : {};
  }
  return theme;
}

export function getThemeBySlug(slug: string) {
  const db = getDb();
  const theme = db.prepare('SELECT * FROM themes WHERE slug = ?').get(slug) as any;
  if (theme) {
    theme.keywords = theme.keywords?.split(',') || [];
    theme.settings = theme.settings ? JSON.parse(theme.settings) : {};
  }
  return theme;
}

export function getAllThemes() {
  const db = getDb();
  const themes = db.prepare('SELECT * FROM themes ORDER BY created_at DESC').all() as any[];
  return themes.map(theme => ({
    ...theme,
    keywords: theme.keywords?.split(',') || [],
    settings: theme.settings ? JSON.parse(theme.settings) : {}
  }));
}

// Blog functions
export function createBlog(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  themeId?: string;
  authorId: string;
  status?: string;
  featuredImage?: string;
  generatedBy?: string;
}) {
  const db = getDb();
  const id = uuidv4();
  
  db.prepare(`
    INSERT INTO blogs (id, title, slug, excerpt, content, theme_id, author_id, status, featured_image, generated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title,
    data.slug,
    data.excerpt || null,
    data.content || null,
    data.themeId || null,
    data.authorId,
    data.status || 'draft',
    data.featuredImage || null,
    data.generatedBy || null
  );
  
  return getBlogById(id);
}

export function getBlogById(id: string) {
  const db = getDb();
  const blog = db.prepare('SELECT * FROM blogs WHERE id = ?').get(id) as any;
  if (blog) {
    blog.keywords = blog.keywords?.split(',') || [];
    blog.images = blog.images ? JSON.parse(blog.images) : [];
    blog.sources = blog.sources ? JSON.parse(blog.sources) : [];
  }
  return blog;
}

export function getBlogBySlug(slug: string) {
  const db = getDb();
  const blog = db.prepare('SELECT * FROM blogs WHERE slug = ?').get(slug) as any;
  if (blog) {
    blog.keywords = blog.keywords?.split(',') || [];
    blog.images = blog.images ? JSON.parse(blog.images) : [];
    blog.sources = blog.sources ? JSON.parse(blog.sources) : [];
  }
  return blog;
}

export function getAllBlogs(status?: string) {
  const db = getDb();
  let query = 'SELECT * FROM blogs';
  if (status) {
    query += ' WHERE status = ?';
  }
  query += ' ORDER BY created_at DESC';
  
  const blogs = status 
    ? db.prepare(query).all(status) as any[]
    : db.prepare(query).all() as any[];
    
  return blogs.map(blog => ({
    ...blog,
    keywords: blog.keywords?.split(',') || [],
    images: blog.images ? JSON.parse(blog.images) : [],
    sources: blog.sources ? JSON.parse(blog.sources) : []
  }));
}

export function updateBlog(id: string, data: Partial<{
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  featuredImage: string;
  images: string[];
  sources: string[];
  wordCount: number;
  readingTime: number;
  publishedAt: string;
}>) {
  const db = getDb();
  const sets: string[] = [];
  const values: any[] = [];
  
  if (data.title) { sets.push('title = ?'); values.push(data.title); }
  if (data.slug) { sets.push('slug = ?'); values.push(data.slug); }
  if (data.excerpt !== undefined) { sets.push('excerpt = ?'); values.push(data.excerpt); }
  if (data.content !== undefined) { sets.push('content = ?'); values.push(data.content); }
  if (data.status) { sets.push('status = ?'); values.push(data.status); }
  if (data.seoTitle !== undefined) { sets.push('seo_title = ?'); values.push(data.seoTitle); }
  if (data.seoDescription !== undefined) { sets.push('seo_description = ?'); values.push(data.seoDescription); }
  if (data.keywords) { sets.push('keywords = ?'); values.push(data.keywords.join(',')); }
  if (data.featuredImage !== undefined) { sets.push('featured_image = ?'); values.push(data.featuredImage); }
  if (data.images) { sets.push('images = ?'); values.push(JSON.stringify(data.images)); }
  if (data.sources) { sets.push('sources = ?'); values.push(JSON.stringify(data.sources)); }
  if (data.wordCount) { sets.push('word_count = ?'); values.push(data.wordCount); }
  if (data.readingTime) { sets.push('reading_time = ?'); values.push(data.readingTime); }
  if (data.publishedAt) { sets.push('published_at = ?'); values.push(data.publishedAt); }
  
  sets.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  db.prepare(`UPDATE blogs SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return getBlogById(id);
}

// Generation functions
export function createGeneration(data: {
  blogId?: string;
  themeId?: string;
  prompt: string;
  model: string;
}) {
  const db = getDb();
  const id = uuidv4();
  
  db.prepare(`
    INSERT INTO generations (id, blog_id, theme_id, prompt, model, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(id, data.blogId || null, data.themeId || null, data.prompt, data.model);
  
  return getGenerationById(id);
}

export function getGenerationById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM generations WHERE id = ?').get(id) as any;
}

export function updateGeneration(id: string, data: {
  status?: string;
  output?: string;
  cost?: number;
  tokensUsed?: number;
  error?: string;
  completedAt?: string;
}) {
  const db = getDb();
  const sets: string[] = [];
  const values: any[] = [];
  
  if (data.status) { sets.push('status = ?'); values.push(data.status); }
  if (data.output !== undefined) { sets.push('output = ?'); values.push(data.output); }
  if (data.cost) { sets.push('cost = ?'); values.push(data.cost); }
  if (data.tokensUsed) { sets.push('tokens_used = ?'); values.push(data.tokensUsed); }
  if (data.error !== undefined) { sets.push('error = ?'); values.push(data.error); }
  if (data.completedAt) { sets.push('completed_at = ?'); values.push(data.completedAt); }
  
  values.push(id);
  db.prepare(`UPDATE generations SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  return getGenerationById(id);
}

// Research functions
export function createResearch(data: {
  query: string;
  topic: string;
  sources?: string;
  key_stats?: string;
  quotes?: string;
  summary?: string;
  credibility_score?: number;
}) {
  const db = getDb();
  const id = uuidv4();
  
  // Set expiration to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  db.prepare(`
    INSERT INTO research (id, query, topic, sources, key_stats, quotes, summary, credibility_score, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.query,
    data.topic,
    data.sources || null,
    data.key_stats || null,
    data.quotes || null,
    data.summary || null,
    data.credibility_score || null,
    expiresAt.toISOString()
  );
  
  return getResearchById(id);
}

export function getResearchById(id: string) {
  const db = getDb();
  const research = db.prepare('SELECT * FROM research WHERE id = ?').get(id) as any;
  if (research) {
    research.sources = research.sources ? JSON.parse(research.sources) : [];
    research.key_stats = research.key_stats ? JSON.parse(research.key_stats) : [];
    research.quotes = research.quotes ? JSON.parse(research.quotes) : [];
    research.used_in = research.used_in ? JSON.parse(research.used_in) : [];
  }
  return research;
}

export function getResearchByTopic(topic: string) {
  const db = getDb();
  const researchItems = db.prepare(
    "SELECT * FROM research WHERE topic LIKE ? AND (expires_at > datetime('now') OR expires_at IS NULL) ORDER BY created_at DESC"
  ).all(`%${topic}%`) as any[];
  
  return researchItems.map(r => ({
    ...r,
    sources: r.sources ? JSON.parse(r.sources) : [],
    key_stats: r.key_stats ? JSON.parse(r.key_stats) : [],
    quotes: r.quotes ? JSON.parse(r.quotes) : [],
    used_in: r.used_in ? JSON.parse(r.used_in) : [],
  }));
}

export function linkResearchToBlog(researchId: string, blogId: string) {
  const db = getDb();
  const research = getResearchById(researchId);
  if (!research) return null;
  
  const usedIn = [...research.used_in, blogId];
  db.prepare('UPDATE research SET used_in = ? WHERE id = ?').run(
    JSON.stringify(usedIn),
    researchId
  );
  
  return getResearchById(researchId);
}
