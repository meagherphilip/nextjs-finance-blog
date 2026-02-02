import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createGeneration, updateGeneration, getBlogById, updateBlog, createBlog, createResearch, getDb } from "@/lib/database";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

interface GenerationRequest {
  topic: string;
  themeId?: string;
  keywords?: string[];
  tone?: string;
  targetLength?: number;
  includeImages?: boolean;
  researchTopic?: boolean;
  voice?: 'expert' | 'experienced' | 'curious' | 'skeptical';
}

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body: GenerationRequest = await req.json();
    const { topic, themeId, keywords, tone, targetLength, includeImages, researchTopic, voice } = body;
    
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    
    // Create generation record
    const generation = createGeneration({
      themeId,
      prompt: topic,
      model: "openrouter/moonshotai/kimi-k2.5",
    });
    
    // Start generation process (async)
    generateBlogContent({
      generationId: generation.id,
      topic,
      keywords,
      tone: tone || "professional",
      voice: voice || "expert",
      targetLength: targetLength || 2000,
      includeImages: includeImages || false,
      researchTopic: researchTopic !== false, // Default to true
      authorId: session.user.id,
    });
    
    return NextResponse.json({
      success: true,
      generationId: generation.id,
      message: "Blog generation started. This may take 3-6 minutes.",
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: "Failed to start generation" }, { status: 500 });
  }
}

// Research function using Brave Search API
async function researchTopic(topic: string, keywords: string[] = []): Promise<any> {
  if (!BRAVE_API_KEY) {
    console.warn("BRAVE_API_KEY not set, skipping research");
    return null;
  }
  
  try {
    const queries = [
      topic,
      `${topic} statistics 2024`,
      `${topic} trends`,
      ...keywords.slice(0, 2)
    ];
    
    const allResults = [];
    
    for (const query of queries.slice(0, 3)) {
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
        {
          headers: {
            'X-Subscription-Token': BRAVE_API_KEY,
            'Accept': 'application/json',
          },
        }
      );
      
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data.web?.results) {
        allResults.push(...data.web.results);
      }
    }
    
    // Extract and structure research
    const research = {
      query: topic,
      sources: allResults.slice(0, 10).map((r: any) => ({
        title: r.title,
        url: r.url,
        description: r.description,
        age: r.age,
        credibility: calculateCredibility(r.url),
      })),
      key_stats: extractStats(allResults.map((r: any) => r.description).join(' ')),
      summary: '', // Will be filled by AI
    };
    
    return research;
  } catch (error) {
    console.error("Research error:", error);
    return null;
  }
}

function calculateCredibility(url: string): number {
  const domain = new URL(url).hostname;
  
  // High credibility
  if (/\.(edu|gov)$/.test(domain)) return 0.95;
  if (['reuters.com', 'bloomberg.com', 'forbes.com', 'wsj.com', 'nytimes.com'].some(d => domain.includes(d))) return 0.9;
  
  // Medium credibility
  if (['medium.com', 'substack.com', 'linkedin.com'].some(d => domain.includes(d))) return 0.7;
  
  // Low credibility (blogs, etc)
  return 0.5;
}

function extractStats(text: string): string[] {
  // Simple regex to find statistics
  const statPatterns = [
    /\d+%/g,
    /\$[\d,]+(?:\.\d{2})?/g,
    /\d+ million/gi,
    /\d+ billion/gi,
  ];
  
  const stats: string[] = [];
  statPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      stats.push(...matches.slice(0, 5));
    }
  });
  
  return [...new Set(stats)].slice(0, 10);
}

async function generateBlogContent(params: {
  generationId: string;
  topic: string;
  keywords?: string[];
  tone: string;
  voice: string;
  targetLength: number;
  includeImages: boolean;
  researchTopic: boolean;
  authorId: string;
}) {
  try {
    const { generationId, topic, keywords, tone, voice, targetLength, authorId } = params;
    
    // Step 1: Research (if enabled)
    let research = null;
    if (params.researchTopic) {
      updateGeneration(generationId, { status: "researching" });
      research = await researchTopic(topic, keywords);
      
      if (research) {
        // Store research in database
        createResearch({
          query: topic,
          topic,
          sources: JSON.stringify(research.sources),
          key_stats: JSON.stringify(research.key_stats),
          summary: '',
        });
      }
    }
    
    // Step 2: Generate outline
    updateGeneration(generationId, { status: "outlining" });
    
    const voiceInstructions = getVoiceInstructions(voice);
    const researchContext = research ? `
Research Data Available:
${research.sources.slice(0, 5).map((s: any) => `- ${s.title}: ${s.description}`).join('\n')}

Key Statistics: ${research.key_stats.join(', ')}
` : '';

    const outlinePrompt = `Create a detailed outline for a blog post about "${topic}".

${voiceInstructions}

Tone: ${tone}
Target length: ${targetLength} words
Keywords to incorporate: ${keywords?.join(', ') || topic}

${researchContext}

Requirements:
- Create 4-6 main sections (H2)
- Each section should have 2-3 subsections (H3) where appropriate
- Plan for specific examples and data points
- Include places for statistics

Return ONLY a JSON object in this format:
{
  "title": "Compelling, click-worthy blog title (50-60 chars)",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 sentence teaser that hooks readers (150-160 chars)",
  "sections": [
    {"heading": "H2 heading", "subsections": ["H3 subheading"], "word_count": 400},
    {"heading": "H2 heading", "subsections": [], "word_count": 350}
  ],
  "keyPoints": ["point 1", "point 2", "point 3"],
  "sources_to_cite": ["source 1", "source 2"]
}`;

    const outline = await callAI(outlinePrompt);
    const outlineData = JSON.parse(outline);
    
    // Step 3: Create blog draft
    updateGeneration(generationId, { status: "writing" });
    
    const blog = createBlog({
      title: outlineData.title,
      slug: outlineData.slug,
      excerpt: outlineData.excerpt,
      authorId,
      status: "generating",
      generatedBy: generationId,
    });
    
    // Step 4: Generate full content section by section
    let fullContent = '';
    let sourcesUsed: string[] = [];
    
    for (const section of outlineData.sections) {
      const sectionPrompt = `Write a detailed section for a blog about "${topic}".

${voiceInstructions}

Section: ${section.heading}
${section.subsections.length > 0 ? `Subsections to cover: ${section.subsections.join(', ')}` : ''}
Target word count: ${section.word_count || 400} words
Tone: ${tone}

${research ? `Include these statistics where relevant: ${research.key_stats.slice(0, 3).join(', ')}` : ''}

Requirements:
- Write in markdown format with proper headings
- Include specific examples and real data
- Use first-person perspective ("I", "my", "me")
- Express opinions and preferences
- Include transitional phrases
- Use variable sentence lengths (mix short and long)
- Add rhetorical questions
- Include imperfection: "kind of", "sort of", "you know?"
- Naturally incorporate keywords: ${keywords?.join(', ') || topic}
- Include at least one statistic or data point
- End with transition to next section

Anti-AI Detection Guidelines:
- Write like you speak, not like a textbook
- Include personal asides ("Honestly...", "Look,")
- Use contractions (don't, can't, won't)
- Add emphasis with ALL CAPS occasionally
- Include a brief anecdote or personal example
- Express uncertainty sometimes ("I'm not sure, but...")

Write ONLY this section content, nothing else.`;

      const sectionContent = await callAI(sectionPrompt);
      fullContent += `\n\n## ${section.heading}\n\n${sectionContent}`;
      
      // Track sources (placeholder - actual source tracking TBD)
      if (research) {
        sourcesUsed.push(...research.sources.slice(0, 2).map((s: any) => s.url));
      }
    }
    
    // Step 5: Generate introduction with hook
    const introPrompt = `Write an engaging introduction (250-350 words) for a blog titled "${outlineData.title}".

${voiceInstructions}

Topic: ${topic}
Tone: ${tone}
Key points to preview: ${outlineData.keyPoints.join(', ')}

Requirements:
- HOOK the reader in first 2 sentences (problem, question, surprising stat)
- Use first-person ("I" statements)
- Include a brief personal anecdote
- Promise what reader will learn
- Build credibility (why trust you)
- Preview the roadmap
- Use conversational tone with contractions
- Add imperfection ("I'll be honest...", "Look,")

Make the reader NEED to continue reading.`;

    const intro = await callAI(introPrompt);
    
    // Step 6: Generate conclusion
    const conclusionPrompt = `Write a compelling conclusion (200-250 words) for a blog about "${topic}".

${voiceInstructions}

Title: ${outlineData.title}
Tone: ${tone}
Key takeaways: ${outlineData.keyPoints.join(', ')}

Requirements:
- Summarize main points (but don't just repeat)
- Emphasize the key takeaway
- Include call-to-action (what to do next)
- Ask an engagement question
- Use first-person perspective
- End with energy and enthusiasm
- Make reader feel empowered

End strong - this is what they'll remember.`;

    const conclusion = await callAI(conclusionPrompt);
    
    // Combine all content
    const finalContent = `${intro}\n\n${fullContent}\n\n## Conclusion\n\n${conclusion}`;
    
    // Calculate metrics
    const wordCount = finalContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    const uniqueSources = [...new Set(sourcesUsed)];
    
    // Step 7: Update blog with content
    updateBlog(blog.id, {
      content: finalContent,
      status: "draft",
      wordCount,
      readingTime,
      keywords: keywords || [topic],
      sources: JSON.stringify(uniqueSources),
    });
    
    // Step 8: Update generation record
    const cost = calculateCost(wordCount);
    updateGeneration(generationId, {
      status: "completed",
      output: blog.id,
      cost,
      completedAt: new Date().toISOString(),
    });
    
    console.log(`Blog generation completed: ${blog.id} (${wordCount} words)`);
    
  } catch (error) {
    console.error("Generation failed:", error);
    updateGeneration(params.generationId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function getVoiceInstructions(voice: string): string {
  const voices: Record<string, string> = {
    expert: `
Voice: Expert Authority
- Write as an experienced professional
- Share insights from years of experience
- Use phrases like "In my experience...", "What I've learned..."
- Confident but not arrogant
- Include specific expertise markers`,
    
    experienced: `
Voice: Been-There-Done-That
- Write as someone who's made mistakes and learned
- Use "When I first started...", "I used to think..."
- Share failures and lessons
- Empathetic and encouraging
- "Here's what I wish I knew..."`,
    
    curious: `
Voice: Curious Explorer
- Write as someone learning alongside reader
- Use "I discovered...", "I was surprised to learn..."
- Ask questions and explore answers
- Enthusiastic about finding things out
- "Let's figure this out together..."`,
    
    skeptical: `
Voice: Healthy Skeptic
- Question conventional wisdom
- Use "But wait...", "Here's what they don't tell you..."
- Challenge assumptions
- Back up skepticism with data
- "I was doubtful until I saw..."`,
  };
  
  return voices[voice] || voices.expert;
}

async function callAI(prompt: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://localhost:3000",
      "X-Title": "AI Blog Generator",
    },
    body: JSON.stringify({
      model: "openrouter/moonshotai/kimi-k2.5",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75, // Slightly higher for more personality
      max_tokens: 4000,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

function calculateCost(wordCount: number): number {
  // Rough estimate: $0.003 per 1000 tokens, ~750 words = 1000 tokens
  // Multiple API calls: outline + intro + sections + conclusion
  const apiCalls = 4 + Math.ceil(wordCount / 500);
  const tokens = (wordCount / 750) * 1000;
  return (tokens / 1000) * 0.003 * apiCalls;
}
