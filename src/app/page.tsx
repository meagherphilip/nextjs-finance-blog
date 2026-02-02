import PostCard from './components/PostCard';
import { getAllPosts } from '@/lib/db';

export default function Home() {
  const posts = getAllPosts();
  
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Finance & Investing Blog</h1>
          <p className="text-gray-600 mt-2">Learn to build wealth, manage money, and achieve financial freedom</p>
        </div>
      </header>
      
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
