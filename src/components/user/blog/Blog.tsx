'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/fetchHooks/useUserFetch';
import { useDebounce } from '@/hooks/helperHooks/useDebounce';

interface Blog {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image: string[];
  createdAt: string;
}

interface FilterOption {
  startDate: string;
  endDate: string;
  status: boolean | undefined;
}

const Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('Newest');
  const [filterOption] = useState<FilterOption>({ startDate: '', endDate: '', status: undefined });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(3);
  const [totalPage, setTotal] = useState<number>(0);

  const {getBlogData} = useFetch();
  const router = useRouter();

  const debouncedSearch = useDebounce(searchValue, 800);

  const searchFilterSortPagination = {
    search: debouncedSearch || '',
    startDate: filterOption.startDate || '',
    endDate: filterOption.endDate || '',
    status: filterOption.status ,
    sortColumn: 'createdAt',
    sortDirection: sortOption === 'Newest' ? 'desc' : 'asc',
    page: currentPage,
    pageSize: pageSize, 
  };


  useEffect(() => {
    fetchBlogs();
  }, [debouncedSearch, filterOption, currentPage, pageSize, sortOption]);

  const fetchBlogs = async () => {
    const response = await getBlogData(searchFilterSortPagination);

    if (response.data) {
      setBlogs(response.data.data.contents);
      setTotal(response.data.data.total);
    }
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(totalPage / pageSize)) {
        setCurrentPage((prevPage) => prevPage + 1);
    }
};

const handlePrevious = () => {
    if (currentPage > 1) {
        setCurrentPage((prevPage) => prevPage - 1);
    }
};

  return (
    <div className="p-6 bg-gradient-to-b min-h-screen">
      <h1 className="text-3xl text-center font-extrabold mb-6 text-customPink dark:text-lightGray">Enhance your relationships</h1>

      {/* Search and Sort Controls */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
         >
          <option value="Newest">Newest</option>
          <option value="Oldest">Oldest</option>
        </select>
      </div>

      {/* Blog Cards */}
      <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 gap-6">
        {blogs ? (
          blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-2xl dark:bg-darkGray shadow-xl dark:border-gray-700 dark:hover:shadow-lg dark:shadow-[0px_4px_15px_rgba(50,180,255,0.4)]) transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              <img src={blog.image[0]} alt={blog.title} className="w-full h-52 object-cover rounded-t-2xl" />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-lightGray mb-2">{blog.title}</h2>
                <p className="text-gray-700 text-sm mb-4 dark:text-gray-400">{blog.subtitle}</p>
                <button
                  className="w-full py-2 text-white font-semibold rounded-lg dark:bg-gray-600 bg-customPink hover:opacity-90 "
                  onClick={() => router.push(`/user/blog/${blog.id}`)}
                >
                  Read More
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-lightGray mt-8">No blogs found.</div>
        )}
      </div>

      {/* Pagination Controls */}

      <div className="flex justify-center mt-6 space-x-4">
      <button 
            onClick={handlePrevious} 
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 dark:text-gray-600' : 'bg-customPink text-white hover:bg-red-500'}`}
            >
            Previous
        </button>

        <span className="px-4 py-2 font-semibold dark:text-lightGray">
          Page {currentPage} of {Math.ceil(totalPage / pageSize)}
        </span>

          <button
              onClick={handleNext}
              disabled={currentPage >= Math.ceil(totalPage / pageSize)}
                className={`px-4 py-2 rounded-lg ${currentPage === totalPage ? 'bg-gray-300 dark:text-gray-600' : 'bg-customPink text-white hover:bg-red-500'}`}
              >  
              Next
          </button>
      </div>
      
    </div>
  );
};

export default Blog;
