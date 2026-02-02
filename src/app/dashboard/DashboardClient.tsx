'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import BlogGenerator from './BlogGenerator';
import BlogList from './BlogList';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: string;
  };
  initialBlogs: any[];
  initialThemes: any[];
}

export default function DashboardClient({ user, initialBlogs, initialThemes }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'blogs' | 'themes'>('generate');
  const [blogs, setBlogs] = useState(initialBlogs);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AI Blog Generator</h1>
              <span className="ml-4 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                Phase 1: Foundation
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Generate Blog
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blogs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Blogs ({blogs.length})
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'themes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Themes ({initialThemes.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generate' && (
          <BlogGenerator onBlogCreated={(newBlog) => setBlogs([newBlog, ...blogs])} />
        )}
        
        {activeTab === 'blogs' && (
          <BlogList blogs={blogs} />
        )}
        
        {activeTab === 'themes' && (
          <div className="text-center py-12">
            <p className="text-gray-500">Themes feature coming in Phase 5</p>
          </div>
        )}
      </main>
    </div>
  );
}
