'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useFetch } from '@/hooks/fetchHooks/useUserFetch';
import NoContent from '../reusables/NoContent';

export interface EventResponseType {
    id?: string,
    title: string,
    description: string,
    image: string[],
    location: string,
    locationURL: string,
    eventDate: string,
    createdAt?: string,
    slots:number,
    totalEntries?:number,
    price:number,
    buyers:{
      userId:string,
      slotsBooked: number,
      totalPaid: number,
    }[],
                    
};

export interface Buyer {
  userId: string;
  slotsBooked: number;
  totalPaid: number;
}

export interface EventDocument {
  _id: string;
  title: string;
  description: string;
  eventDate: string; // Change to Date if necessary
  image: string[];
  location: string;
  locationURL: string;
  price: number;
  slots: number;
  totalEntries: number;
  totalSales: number;
  buyers: Buyer[]; // Array of buyers
  createdAt: string;
  updatedAt: string;
}

export interface SalesDocument {
  _id: string;
  userId: string;
  eventId: EventDocument; // Should be a single object, not an array
  saleType: "subscription" | "event";
  billedAmount: number;
  bookedSlots?: number;
  createdAt: string;
  updatedAt: string;
}



const BookingDetailsTable: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [eventData, setEventData] = useState<SalesDocument[]>([]);
  const {getBookedEventsData} = useFetch()

  useEffect(() => {
    fetchData();
  },[]);

  async function fetchData () {
    if(!userInfo?.id) return;
    const response = await getBookedEventsData(userInfo?.id);

    if (response.data) {
      setEventData(response.data);
    };
  };

  return (
  <div className="container mx-auto dark:bg-nightBlack p-6 md:p-8 ">
    <h1 className="text-3xl font-bold text-customPink dark:text-lightGray mb-6 text-center">
      Confirmed Events
    </h1>

    {eventData.length ? (
      <div className="overflow-x-auto rounded-lg bg-white dark:bg-darkGray shadow-lg border dark:border-gray-600">
        {/* Scrollable table wrapper */}
        <div className="max-h-[500px] overflow-y-auto scrollable-container">
          <table className="min-w-full table-auto text-center">
            <thead className="bg-gray-50 dark:bg-darkGray  border-b dark:border-gray-600 text-center sticky top-0 z-10">
              <tr>
                <th className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-lightGray">Event</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-lightGray">Location</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-lightGray">Event Date</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-lightGray">Booked Slots</th>
                <th className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-lightGray">Booked Price</th>
              </tr>
            </thead>
            <tbody >
              {eventData.map((event, index) => (
                <tr
                  key={event._id}
                  className={`${
                    index % 2 === 0 ? "bg-white dark:bg-nightBlack dark:hover:bg-black" : "bg-gray-50 dark:bg-darkGray dark:hover:bg-gray-600"
                  }   hover:bg-gray-100  transition-all`}
                >
                  {/* Event Name & Image */}
                  <td className="py-4 px-6 text-sm text-gray-800 dark:text-lightGray">
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src={event.eventId.image[0]}
                        alt={event.eventId.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <p className="mt-2 text-center">{event.eventId.title}</p>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-6 text-sm text-gray-800 dark:text-lightGray">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{event.eventId.location}</span>
                      <a
                        href={event.eventId.locationURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:font-semibold mt-1"
                      >
                        View Location
                      </a>
                    </div>
                  </td>

                  {/* Event Date */}
                  <td className="py-4 px-6 text-sm text-gray-800 dark:text-lightGray">
                    {new Date(event.eventId.eventDate).toLocaleDateString()}
                  </td>

                  {/* Booked Slots */}
                  <td className="py-4 px-6 text-sm text-gray-800 dark:text-lightGray">
                    <span className="block">{event.bookedSlots}</span>
                  </td>

                  {/* Price per Slot */}
                  <td className="py-4 px-6 text-sm text-gray-800 dark:text-lightGray">
                    <span>
                      {event?.bookedSlots
                        ? (event.billedAmount / event?.bookedSlots).toFixed(2)
                        : 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      <NoContent message='No events booked yet'/>
    )}
  </div>
  );
};

export default BookingDetailsTable;
