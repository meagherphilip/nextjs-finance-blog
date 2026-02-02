import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGeneration, updateGeneration, getBlogById, updateBlog, createBlog } from '@/lib/database';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

interface GenerationRequest {
  topic: string;
  themeId?: string;
  keywords?: string[];
  tone?: string;
  targetLength?: number;
  includeImages?: boolean;
  researchTopic?: boolean;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body: GenerationRequest = await req.json();
    const { topic, themeId, keywords, tone, targetLength, includeImages, researchTopic } = body;
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }
    
    // Create generation record
    const generation = createGeneration({
      themeId,
      prompt: topic,
      model: 'openrouter/moonshotai/kimi-k2.5'
    });
    
    // Start generation process (async)
    generateBlogContent({
      generationId: generation.id,
      topic,
      keywords,
      tone: tone || 'professional',
      targetLength: targetLength || 2000,
      includeImages: includeImages || false,
      researchTopic: researchTopic || false,
      authorId: session.user.id
    });
    
    return NextResponse.json({ 
      success: true, 
      generationId: generation.id,
      message: 'Blog generation started'
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Failed to start generation' }, { status: 500 });
  }
}

async function generateBlogContent(params: {
  generationId: string;
  topic: string;
  keywords?: string[];
  tone: string;
  targetLength: number;
  includeImages: boolean;
  researchTopic: boolean;
  authorId: string;
}) {
  try {
    const { generationId, topic, keywords, tone, targetLength, authorId } = params;
    
    updateGeneration(generationId, { status: 'researching' });
    
    // Step 1: Generate outline
    const outlinePrompt = `Create a detailed outline for a blog post about "${topic}".
Tone: ${tone}
Target length: ${targetLength} words
Keywords: ${keywords?.join(', ') || 'natural integration'}

Return ONLY a JSON object in this format:
{
  "title": "Compelling blog title",
  "slug": "url-friendly-slug",
  "excerpt": "2-3 sentence teaser",
  "sections": [
    {"heading": "H2 heading", "subsections": ["H3 subheading", "H3 subheading"]},
    {"heading": "H2 heading", "subsections": []}
  ],
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

    const outline = await callAI(outlinePrompt);
    const outlineData = JSON.parse(outline);
    
    updateGeneration(generationId, { status: 'writing' });
    
    // Step 2: Create blog draft
    const blog = createBlog({
      title: outlineData.title,
      slug: outlineData.slug,
      excerpt: outlineData.excerpt,
      authorId,
      status: 'generating',
      generatedBy: generationId
    });
    
    // Step 3: Generate full content section by section
    let fullContent = '';
    const targetWordsPerSection = Math.floor(targetLength / outlineData.sections.length);
    
    for (const section of outlineData.sections) {
      const sectionPrompt = `Write a detailed section for a blog about "${topic}".

Section: ${section.heading}
${section.subsections.length > 0 ? `Subsections to cover: ${section.subsections.join(', ')}` : ''}
Tone: ${tone}
Target word count: ${targetWordsPerSection} words

Requirements:
- Write in markdown format
- Include specific examples, data points, and insights
- Make it engaging and valuable for readers
- Naturally incorporate these keywords if relevant: ${keywords?.join(', ') || topic}
- Include a compelling opening hook
- End with a transition to the next section

Write only this section, nothing else.`;

      const sectionContent = await callAI(sectionPrompt);
      fullContent += `\n\n## ${section.heading}\n\n${sectionContent}`;
    }
    
    // Step 4: Generate introduction and conclusion
    const introPrompt = `Write an engaging introduction (200-300 words) for a blog titled "${outlineData.title}".
Topic: ${topic}
Tone: ${tone}
Key points to preview: ${outlineData.keyPoints.join(', ')}

Hook the reader immediately. Make them want to continue reading.`;

    const intro = await callAI(introPrompt);
    
    const conclusionPrompt = `Write a compelling conclusion (150-200 words) for a blog about "${topic}".
Title: ${outlineData.title}
Tone: ${tone}
Key takeaways: ${outlineData.keyPoints.join(', ')}

Summarize the main points and include a call-to-action.`;

    const conclusion = await callAI(conclusionPrompt);
    
    // Combine all content
    const finalContent = `${intro}\n\n${fullContent}\n\n## Conclusion\n\n${conclusion}`;
    
    // Calculate word count and reading time
    const wordCount = finalContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    // Step 5: Update blog with content
    updateBlog(blog.id, {
      content: finalContent,
      status: 'draft',
      wordCount,
      readingTime,
      keywords: keywords || [topic]
    });
    
    // Step 6: Update generation record
    const cost = calculateCost(wordCount);
    updateGeneration(generationId, {
      status: 'completed',
      output: blog.id,
      cost,
      completedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Generation failed:', error);
    updateGeneration(params.generationId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function callAI(prompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://localhost:3000',
      'X-Title': 'AI Blog Generator'
    },
    body: JSON.stringify({
      model: 'openrouter/moonshotai/kimi-k2.5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

function calculateCost(wordCount: number): number {
  // Rough estimate: $0.003 per 1000 tokens, ~750 words = 1000 tokens
  const tokens = (wordCount / 750) * 1000;
  return (tokens / 1000) * 0.003 * 5; // Multiple API calls
}
