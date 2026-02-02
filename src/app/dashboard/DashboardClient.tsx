'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  created_at: string;
  word_count?: number;
}

interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Props {
  user: User;
  initialBlogs: Blog[];
  initialThemes: Theme[];
}

export default function DashboardClient({ user, initialBlogs, initialThemes }: Props) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [targetLength, setTargetLength] = useState(2000);
  const [message, setMessage] = useState('');
  const router = useRouter();
  
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          tone,
          targetLength
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Blog generation started! Check back in a few minutes.');
        setTopic('');
        setKeywords('');
      } else {
        setMessage('Error: ' + data.error);
      }
    } catch (error) {
      setMessage('Failed to start generation');
    } finally {
      setGenerating(false);
    }
  };
  
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Blog Generator</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Generate New Blog</h2>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Cryptocurrency Investing for Beginners"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="bitcoin, ethereum, crypto wallet"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="educational">Educational</option>
                    <option value="storytelling">Storytelling</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Length: {targetLength} words
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="500"
                    value={targetLength}
                    onChange={(e) => setTargetLength(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1,000</span>
                    <span>5,000</span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={generating || !topic}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generating...' : 'Generate Blog'}
                </button>
              </form>
              
              {message && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">
                  {message}
                </div>
              )}
            </div>
            
            {/* Themes */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Themes</h2>
              {initialThemes.length === 0 ? (
                <p className="text-gray-500 text-sm">No themes yet</p>
              ) : (
                <ul className="space-y-2">
                  {initialThemes.map(theme => (
                    <li key={theme.id} className="text-sm">
                      <span className="font-medium">{theme.name}</span>
                      {theme.description && (
                        <p className="text-gray-500 text-xs">{theme.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Blog List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Your Blogs</h2>
              </div>
              
              {blogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No blogs yet. Generate your first one!
                </div>
              ) : (
                <div className="divide-y">
                  {blogs.map(blog => (
                    <div key={blog.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{blog.title}</h3>
                          {blog.excerpt && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {blog.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs ${
                              blog.status === 'published' ? 'bg-green-100 text-green-700' :
                              blog.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {blog.status}
                            </span>
                            {blog.word_count && (
                              <span>{blog.word_count} words</span>
                            )}
                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
