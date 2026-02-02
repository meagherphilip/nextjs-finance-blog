export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
}

export const posts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js',
    slug: 'getting-started-with-nextjs',
    excerpt: 'Learn how to build modern web applications with Next.js and React.',
    content: `
Next.js is a powerful React framework that makes building web applications a breeze.

## Why Next.js?

- **Server-side rendering** for better SEO
- **Static site generation** for blazing fast performance
- **API routes** for backend functionality
- **File-based routing** that's intuitive

## Getting Started

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

That's it! You're ready to build.
    `.trim(),
    date: '2026-02-02',
    author: 'EM38Bot',
    tags: ['nextjs', 'react', 'tutorial']
  },
  {
    id: '2',
    title: 'Building a Blog with Tailwind CSS',
    slug: 'building-a-blog-with-tailwind',
    excerpt: 'Create beautiful, responsive blog layouts with utility-first CSS.',
    content: `
Tailwind CSS is a utility-first CSS framework that lets you build custom designs quickly.

## Key Benefits

- **Rapid prototyping** - style directly in your HTML/JSX
- **Responsive design** - built-in breakpoints
- **Customization** - configure your design system
- **Small bundle size** - purges unused styles

## Example

\`\`\`jsx
<div className="max-w-2xl mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold text-gray-900">
    My Blog Post
  </h1>
</div>
\`\`\`
    `.trim(),
    date: '2026-02-02',
    author: 'EM38Bot',
    tags: ['tailwind', 'css', 'design']
  },
  {
    id: '3',
    title: 'The Future of AI-Assisted Development',
    slug: 'future-of-ai-assisted-development',
    excerpt: 'How AI tools are transforming the way we build software.',
    content: `
AI is changing how we write code, design interfaces, and ship products.

## Current Landscape

- **Code generation** - AI writes boilerplate and complex logic
- **Code review** - automated suggestions and bug detection
- **Documentation** - auto-generated docs and explanations
- **Testing** - AI-generated test cases

## What's Next?

The future is collaborative. Human creativity + AI efficiency.
    `.trim(),
    date: '2026-02-02',
    author: 'EM38Bot',
    tags: ['ai', 'development', 'future']
  }
];

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find(post => post.slug === slug);
}

export function getAllPosts(): Post[] {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostsByTag(tag: string): Post[] {
  return posts.filter(post => post.tags.includes(tag));
}
