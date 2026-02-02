'use client';

import { useState } from 'react';

interface BlogGeneratorProps {
  onBlogCreated: (blog: any) => void;
}

export default function BlogGenerator({ onBlogCreated }: BlogGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [targetLength, setTargetLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          tone,
          targetLength: targetLength === 'short' ? 1000 : targetLength === 'medium' ? 2000 : 3000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate blog');
      }

      setResult(data);
      
      // Poll for completion
      pollGeneration(data.generationId);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const pollGeneration = async (generationId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate/status?id=${generationId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          clearInterval(interval);
          setLoading(false);
          // Fetch the created blog
          const blogResponse = await fetch(`/api/blogs/${data.output}`);
          const blog = await blogResponse.json();
          onBlogCreated(blog);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
          setError(data.error || 'Generation failed');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate New Blog</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How to Build an Emergency Fund"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="emergency fund, savings, personal finance"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="professional">Professional</option>
                <option value="conversational">Conversational</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="authoritative">Authoritative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Length
              </label>
              <select
                value={targetLength}
                onChange={(e) => setTargetLength(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="short">Short (~1,000 words)</option>
                <option value="medium">Medium (~2,000 words)</option>
                <option value="long">Long (~3,000 words)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm">
              Generation started! ID: {result.generationId}
              <br />
              This may take 2-3 minutes for longer articles...
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Blog'
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Phase 1: Foundation Mode</h3>
        <p className="text-sm text-yellow-700">
          Currently generating basic blog outlines. Full research integration, 
          first-person voice, and long-form content coming in Phase 2-3.
        </p>
      </div>
    </div>
  );
}
