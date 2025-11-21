'use client';

import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '@/lib/api';
import { Post } from '@/types';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'flagged'>('all');
  const [universityId, setUniversityId] = useState<string>('');

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      const admin = JSON.parse(adminData);
      if (admin.universityId) {
        setUniversityId(admin.universityId);
        fetchPosts(admin.universityId);
        const interval = setInterval(() => fetchPosts(admin.universityId), 30000);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const fetchPosts = async (universityId: string) => {
    try {
      console.log('Fetching posts for university:', universityId);
      const { data } = await api.get(`/admin/university/${universityId}/posts`);
      console.log('Posts received:', data.length);
      setPosts(data);
    } catch (error: any) {
      console.error('Failed to fetch posts:', error.response?.data || error.message);
    }
  };

  const handleApprove = async (postId: string) => {
    try {
      await api.patch(`/admin/posts/${postId}/approve`);
      if (universityId) fetchPosts(universityId);
    } catch (error) {
      console.error('Failed to approve post:', error);
    }
  };

  const handleRemove = async (postId: string) => {
    if (!confirm('Are you sure you want to remove this post?')) return;
    try {
      await api.patch(`/admin/posts/${postId}/remove`);
      if (universityId) fetchPosts(universityId);
    } catch (error) {
      console.error('Failed to remove post:', error);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Posts Management</h1>
        <p className="text-gray-600 mt-2">Review and moderate posts from your university</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'active'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'flagged'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Flagged
          </button>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No posts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : post.status === 'flagged'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {post.status}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{post.description}</p>
                    <p className="text-sm text-gray-500">
                      Posted on {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Eye size={18} />
                    </button>
                    {post.status === 'flagged' && (
                      <>
                        <button
                          onClick={() => handleApprove(post._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleRemove(post._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
