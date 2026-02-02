interface BlogListProps {
  blogs: any[];
}

export default function BlogList({ blogs }: BlogListProps) {
  if (blogs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No blogs yet. Generate your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <div key={blog.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {blog.title || 'Untitled'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Status: <span className={`capitalize ${
                  blog.status === 'published' ? 'text-green-600' :
                  blog.status === 'draft' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>{blog.status}</span>
                {blog.word_count && ` • ${blog.word_count} words`}
                {blog.created_at && ` • ${new Date(blog.created_at).toLocaleDateString()}`}
              </p>
              {blog.excerpt && (
                <p className="text-gray-600 mt-2 line-clamp-2">{blog.excerpt}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <a
                href={`/blog/${blog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View →
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
