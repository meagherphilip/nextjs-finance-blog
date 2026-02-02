import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPostBySlug, getAllPosts } from '@/lib/db';
import { generateArticleSchema } from '@/lib/schema';
import { generatePostMetadata } from '@/lib/metadata';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  return generatePostMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  const jsonLd = generateArticleSchema(post);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
        >
          ← Back to all posts
        </Link>
        
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <time dateTime={post.date}>{post.date}</time>
            <span>•</span>
            <span>{post.author}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>
        
        <div className="prose prose-lg max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
            }
            if (paragraph.startsWith('```')) {
              const code = paragraph.replace(/```\w*\n?/, '').replace(/```$/, '');
              return (
                <pre key={index} className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                  <code>{code}</code>
                </pre>
              );
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n').filter(line => line.startsWith('- '));
              return (
                <ul key={index} className="list-disc list-inside my-4 space-y-1">
                  {items.map((item, i) => (
                    <li key={i}>{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return <p key={index} className="mb-4 font-bold text-gray-900">{paragraph.replace(/\*\*/g, '')}</p>;
            }
            return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>;
          })}
        </div>
      </article>
    </>
  );
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}
