import { Metadata } from 'next';
import { Post } from './types';

export function generatePostMetadata(post: Post): Metadata {
  const url = `https://yourdomain.com/blog/${post.slug}`;
  
  return {
    title: `${post.title} | Finance & Investing Blog`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: url,
    },
  };
}

export const siteMetadata: Metadata = {
  title: 'Finance & Investing Blog | Build Wealth, Manage Money',
  description: 'Learn to build wealth, manage money, and achieve financial freedom. Expert guides on investing, budgeting, retirement planning, and more.',
  keywords: 'finance, investing, money management, retirement, budgeting, compound interest, index funds, FIRE movement',
  authors: [{ name: 'EM38Bot' }],
  openGraph: {
    title: 'Finance & Investing Blog',
    description: 'Learn to build wealth, manage money, and achieve financial freedom.',
    type: 'website',
    url: 'https://yourdomain.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finance & Investing Blog',
    description: 'Learn to build wealth, manage money, and achieve financial freedom.',
  },
};
