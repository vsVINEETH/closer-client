'use client';

import { useEffect, useState } from 'react';
import { FaUnlockAlt } from 'react-icons/fa';
import useAxios from '@/hooks/useAxios/useAxios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { errorToast } from '@/utils/toasts/toats';

interface User {
  _id: string;
  username: string;
  email: string;
  image: string[]; // Assuming 'image' is an array of URLs
}

const BlockTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const { handleRequest } = useAxios();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await handleRequest({
      url: '/api/user/block_list',
      method: 'GET',
      params: {
        id: userInfo?.id,
      },
    });

    if (response.error) {
      errorToast(response.error);
    }
    if (response.data) {
      setUsers(response.data);
    }
  };

  const handleUnblock = async (id: string) => {
    const response = await handleRequest({
        url:'/api/user/unblock',
        method:'PUT',
        data:{
            unblockId:id,
            id:userInfo?.id
        }
    });

    if(response.error){
        errorToast(response.error)
    }
    if(response.data){
        console.log(response.data);
        setUsers(response.data)
    }

  };

  return (
    <div className="container mx-auto p-6 md:p-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Blocked Users</h1>
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white">
        <table className="min-w-full table-auto text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-4 px-4 md:px-6 text-sm font-semibold text-gray-700">Name</th>
              <th className="py-4 px-4 md:px-6 text-sm font-semibold text-gray-700">Email</th>
              <th className="py-4 px-4 md:px-6 text-sm font-semibold text-gray-700">Image</th>
              <th className="py-4 px-4 md:px-6 text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user._id}
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } hover:bg-gray-100 transition`}
              >
                <td className="py-4 px-4 md:px-6 text-sm text-gray-800">{user.username}</td>
                <td className="py-4 px-4 md:px-6 text-sm text-gray-600">{user.email}</td>
                <td className="py-4 px-4 md:px-6 text-sm">
                  <img
                    src={user.image[0]} // Show the first image
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                </td>
                <td className="py-4 px-4 md:px-6">
                  <button
                    onClick={() => handleUnblock(user._id)}
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
    </div>
  );
};

export default BlockTable;
