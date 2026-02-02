import { Post } from './types';

export function generateArticleSchema(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      '@type': 'Organization',
      name: 'Finance & Investing Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yourdomain.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://yourdomain.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Finance & Investing Blog',
    description: 'Learn to build wealth, manage money, and achieve financial freedom.',
    url: 'https://yourdomain.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://yourdomain.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}
