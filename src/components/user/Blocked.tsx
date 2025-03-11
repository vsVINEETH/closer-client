'use client';

import { useEffect, useState } from 'react';
import { FaUnlockAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { blockConfirm } from '@/utils/sweet_alert/sweetAlert';
import { useFetch } from '@/hooks/fetchHooks/useUserFetch';
import { useSecurity } from '@/hooks/crudHooks/user/useSecurity';
import NoContent from '../reusables/NoContent';
interface User {
  _id: string;
  username: string;
  email: string;
  image: string[]; // Assuming 'image' is an array of URLs
  isBlocked: boolean,
}

const BlockTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const {getBlockedUsersList} = useFetch();
  const {unblockUser} = useSecurity()

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if(!userInfo?.id){ return }
    const response = await getBlockedUsersList(userInfo?.id);
    if (response.data) {
      setUsers(response.data);
    }
  };

  const handleUnblock = async (userIdToUnblock: string, index: number) => {
    const confirm = await blockConfirm(users[index].isBlocked);
    if(!confirm || !userInfo?.id){return};
    const response = await unblockUser(userIdToUnblock, userInfo?.id)

    if(response.data){
       setUsers(response.data);
    };

  };

  return (
    <div className="container mx-auto p-6 md:p-8  rounded-lg ">
      <h1 className="text-3xl font-bold mb-6 text-customPink text-center dark:text-lightGray">Blocked Users</h1>
      {users.length  ? ( <div className="overflow-x-auto rounded-lg bg-white dark:bg-darkGray shadow-lg border dark:border-gray-600">
        <div className="max-h-[500px] overflow-y-auto scrollable-container">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-gray-50 dark:bg-darkGray  border-b dark:border-gray-600">
            <tr>
              <th className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-lightGray">Name</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-lightGray">Email</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-lightGray">Image</th>
              <th className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-lightGray">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user._id}
                className={`${
                  index % 2 === 0 ? "bg-white dark:bg-nightBlack dark:hover:bg-black" : "bg-gray-50 dark:bg-darkGray dark:hover:bg-gray-600"
                }   hover:bg-gray-100  transition-all`}              >
                <td className="py-4 px-6 text-sm text-gray-800 dark:text-lightGray">{user.username}</td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-lightGray">{user.email}</td>
                <td className="py-4 px-6 text-sm">
                  <img
                    src={user.image[0]} 
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleUnblock(user._id, index)}
                    className="flex items-center bg-customPink hover:bg-red-500 dark:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  >
                    <FaUnlockAlt className="mr-2" />
                    Unblock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>) : <NoContent message='No blocked users found '/>}
    </div>
  );
};

export default BlockTable;
