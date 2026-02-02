import Link from 'next/link';
import { Post } from '../data/posts';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <time>{post.date}</time>
          <span>•</span>
          <span>{post.author}</span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
            {post.title}
          </Link>
        </h2>
        
        <p className="text-gray-600 mb-4">{post.excerpt}</p>
        
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
      </div>
    </article>
  );
}
