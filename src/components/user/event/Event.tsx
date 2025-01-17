'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAxios from '@/hooks/useAxios/useAxios';

interface Event {
  _id: string;
  title: string;
  location: string;
  locationURL: string;
  description: string,
  image: string[];
  eventDate: string,
  createdAt: string,
}

const Event: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const { handleRequest } = useAxios();
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [events, searchQuery, sortOption]);

  const fetchEvents = async () => {
    const response = await handleRequest({
      url: '/api/admin/events',
      method: 'GET',
    });

    if (response.error) {
      console.error('Something happened');
    }

    if (response.data) {
      setEvents(response.data);
    }
  };

  const applyFiltersAndSort = () => {
    let updatedEvents = [...events];

    // Apply search filter
    if (searchQuery) {
      updatedEvents = updatedEvents.filter((blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortOption === 'Newest') {
        updatedEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'Oldest') {
        updatedEvents.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOption === 'Title A-Z') {
        updatedEvents.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'Title Z-A') {
        updatedEvents.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredEvents(updatedEvents);
  };

  return (
    <div className="p-6 bg-gradient-to-b min-h-screen">
      <h1 className="text-3xl text-center font-extrabold mb-6  text-customPink">
        Upcoming events for you
      </h1>

      {/* Search and Filter Controls */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <input
          type="text"
          placeholder="Search events by title..."
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
        {filteredEvents.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={event.image[0]}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{event.title}</h3>
              {/* <h4 className="text-lg font-bold text-gray-800 mb-3">{new Date(event.eventDate).toLocaleDateString()}</h4> */}
              <p className="text-gray-600 text-md font-semibold">Venue: {event.location}</p>
              <p className="text-gray-600 text-md font-semibold mb-2">Date: {new Date(event.eventDate).toLocaleDateString()}</p>
              <p className="text-gray-600 text-md font-semibold mb-4">{event.description}</p>
              <a href={event.locationURL} target='blank'>
              <button
                className="px-2 py-2 bg-customPink text-white font-semibold rounded-lg hover:bg-red-400 transition-colors duration-300"
              >
                Location
              </button>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredEvents.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No blogs found. Try a different search or filter.
        </div>
      )}
    </div>
  );
};

export default Event;