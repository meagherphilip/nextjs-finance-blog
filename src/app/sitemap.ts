import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const baseUrl = 'https://yourdomain.com';
  
  const postUrls = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postUrls,
  ];
}
