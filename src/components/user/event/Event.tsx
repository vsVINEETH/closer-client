'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Hand } from 'lucide-react';
import { useFetch } from '@/hooks/fetchHooks/useAdminFetch';
import { useDebounce } from '@/hooks/helperHooks/useDebounce';
interface Event {
  _id: string;
  title: string;
  location: string;
  locationURL: string;
  description: string;
  image: string[];
  eventDate: string;
  createdAt: string;
  price: number,
  slots: number,
  totalEntries: number,
}
interface FilterOption {
  startDate: string;
  endDate: string;
  status: boolean | undefined;
}

const Event: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('Newest');

  const [filterOption] = useState<FilterOption>({ startDate: '', endDate: '', status: undefined });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState<number>(3);
  const [totalPage, setTotal] = useState<number>(0);

  const {getEventData} = useFetch();
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
    fetchEvents();
  }, [debouncedSearch, filterOption, currentPage, pageSize, sortOption]);

  async function fetchEvents () {
    const response = await getEventData(searchFilterSortPagination)
    if (response.data) {
      setEvents(response.data.events);
      setTotal(response.data.total)
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
      <h1 className="text-3xl text-center font-extrabold mb-6 text-customPink dark:text-lightGray">Upcoming events for you</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <input
          type="text"
          placeholder="Search events by title..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
         >
          <option value="Newest">Newest</option>
          <option value="Oldest">Oldest</option>
        </select>
      </div>

      <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events && events?.map((event) => (
          <div
            key={event._id}
            className="bg-white dark:bg-darkGray rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-700 overflow-hidden"
          >
            <img
              src={event.image[0]}
              alt={event.title}
              className="w-full h-52 object-cover rounded-t-2xl"
            />
            <div className="bg-white dark:bg-darkGray rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 space-y-3 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
              
              <div className="text-gray-600 dark:text-gray-300 text-sm flex flex-col space-y-1">
                <p className="flex items-center">
                  📍 <span className="ml-1">Venue: {event.location}</span>
                </p>
                <p className="flex items-center">
                  📅 <span className="ml-1">Date: {new Date(event.eventDate).toLocaleDateString()}</span>
                </p>
              </div>

                <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300 text-sm font-medium">
                  <div className="flex items-center">
                    <Coins size={16} className="mr-1 text-yellow-500" />
                    <span>Price: <span className="font-semibold">{event.price}</span> / per head</span>
                  </div>
                  <div className="flex items-center">
                    <Hand size={16} className="mr-1 text-red-500" />
                    <span>Slots: <span className="font-semibold">{event.slots} left</span></span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-3">{event.description}</p>

                <button
                  onClick={() => router.push(`/user/events/${event._id}`)}
                  className="w-full mt-4 py-2 text-white font-semibold rounded-lg bg-customPink dark:bg-gray-600 hover:opacity-90 hover:scale-[1.02] transition-transform duration-300"
                >
                  Book Now
                </button>
            </div>
          </div>
        ))}
      </div>


      {events.length === 0 && (
        <div className="text-center text-gray-500 dark:bg-lightGray mt-8">No events found. Try a different search or filter.</div>
      )}

  
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

export default Event;
