'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAxios from '@/hooks/useAxios/useAxios';

interface Blog {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image: string[];
  createdAt: string;
}

const Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const { handleRequest } = useAxios();
  const router = useRouter();

  useEffect(() => {
    fetchBlog();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [blogs, searchQuery, sortOption]);

  const fetchBlog = async () => {
    const response = await handleRequest({
      url: '/api/employee/content_data',
      method: 'GET',
    });

    if (response.error) {
      console.error('Something happened');
    }

    if (response.data) {
      setBlogs(response.data.data);
    }
  };

  const applyFiltersAndSort = () => {
    let updatedBlogs = [...blogs];

    // Apply search filter
    if (searchQuery) {
      updatedBlogs = updatedBlogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortOption === 'Newest') {
      updatedBlogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'Oldest') {
      updatedBlogs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOption === 'Title A-Z') {
      updatedBlogs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'Title Z-A') {
      updatedBlogs.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredBlogs(updatedBlogs);
  };

  return (
    <div className="p-6 bg-gradient-to-b min-h-screen">
      <h1 className="text-3xl text-center font-extrabold mb-6  text-customPink">
        Enhance your relationships
      </h1>

      {/* Search and Filter Controls */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <input
          type="text"
          placeholder="Search blogs by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        >
          <option value="Newest">Newest</option>
          <option value="Oldest">Oldest</option>
          <option value="Title A-Z">Title A-Z</option>
          <option value="Title Z-A">Title Z-A</option>
        </select>
      </div>

      {/* Blog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={blog.image[0]}
              alt={blog.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{blog.title}</h2>
              <p className="text-gray-600 text-sm mb-4">{blog.subtitle}</p>
              <button
                className="px-2 py-2 bg-customPink text-white font-semibold rounded-lg hover:bg-red-400 transition-colors duration-300"
                onClick={() => router.push(`/user/blog/${blog.id}`)}
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredBlogs.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No blogs found. Try a different search or filter.
        </div>
      )}
    </div>
  );
};

export default Blog;
