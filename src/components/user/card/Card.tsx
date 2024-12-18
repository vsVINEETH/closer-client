"use client";

import React, { useEffect, useState } from "react";
import { X, Info, Flame, RotateCcw } from "lucide-react";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import useAxios from "@/hooks/useAxios/useAxios";
import { errorToast, infoToast, successToast } from "@/utils/toasts/toats";
import Interest from "./interest";

export interface UserDTO {
  _id: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  interestedIn?: string;
  lookingFor?: string;
  isBlocked?: boolean;
  image?: string[];
  setupCompleted?: boolean;
  createdAt?: string | Date;
}

const dummy = [
  {
    _id: "12345",
    username: "john_doe",
    email: "johndoe@example.com",
    password: "hashed_password_123", // optional
    phone: "+1-234-567-8901",
    dob: "1990-04-15",
    gender: "Male",
    interestedIn: "Music, Travel, Technology",
    lookingFor: "Friendship",
    isBlocked: false,
    image: [
      "https://picsum.photos/200/300?random=1",
      "https://picsum.photos/200/300?random=2",
    ],
    setupCompleted: true,
    createdAt: new Date().toISOString(),
  },
];

// Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  userDetails: UserDTO;
  onBlock: () => void;
  onReport: () => void;
}> = ({ isOpen, onClose, userDetails, onBlock, onReport }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Details */}
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {userDetails?.username}
          </p>
          <p>
            <strong>Birthday:</strong> {userDetails?.dob}
          </p>
          <p>
            <strong>Looking For:</strong> {userDetails?.lookingFor}
          </p>
          <p>
            <strong>Interested In:</strong> {userDetails?.interestedIn}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={onBlock}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
          >
            Block User
          </button>
          <button
            onClick={onReport}
            className="px-4 py-2 bg-yellow-400 text-white rounded-lg shadow hover:bg-yellow-500"
          >
            Report User
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileCard: React.FC = () => {
  const [data, setData] = useState<UserDTO[]>(dummy);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const {  handleRequest } = useAxios();

  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const response = await handleRequest({
      url: "/api/user/users_data",
      method: "GET",
      params: { id: userInfo?.id },
    });

    if (response.error) {
      errorToast(response.error);
    }

    if (response.data) {
      console.log(response.data)
      setData(response.data);
    }
  };

  const currentUser: UserDTO = data[currentIndex];

  const handleNextUser = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      infoToast("No more users to show.");
    }
  };

  const handlePreviousUser = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      infoToast("You are already at the first user.");
    }
  };

  const handleBlockUser = async() => {
    const response = await handleRequest({
      url:'/api/user/block',
      method:'PUT',
      data:{
        blockedId: currentUser?._id,
        id: userInfo?.id
      }
    })
    if(response.error){
      errorToast(response.error)
    }
    if(response.data){
      setData(response.data);
      successToast(`${currentUser?.username} has been blocked.`);
      setIsModalOpen(false);
      handleNextUser();
    }

  };

  const handleReportUser = async () => {
    console.log(currentUser,'lop')
    const response = await handleRequest({
      url:'/api/user/report',
      method:'PUT',
      data:{
        reportedId: currentUser._id,
        id: userInfo?.id
      }
    })
    if(response.error){
      errorToast(response.error)
    }
    if(response.data){
      setData(response.data);
      successToast(`${currentUser?.username} has been reported.`);
      setIsModalOpen(false);
      handleNextUser();
    }
  };

  return (
    <div className="min-w-min max-w-sm rounded-3xl overflow-hidden shadow-lg">
      {/* Card Image with Gradient Overlay */}
      <div className="relative h-[400px]">
        <img
          src={
            currentUser?.image && currentUser?.image[0]
              ? currentUser?.image[0]
              : "https://img.freepik.com/free-photo/background_53876-32170.jpg"
          }
          alt="Profile"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Info Button - Top Right */}
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsModalOpen(true)}
        >
          <Info className="w-5 h-5 text-white" />
        </button>

        {/* User Info - Bottom Left */}
        <div className="absolute bottom-20 left-4 text-white">
          <h3 className="text-xl font-semibold">
            {currentUser?.username},{" "}
            {currentUser?.dob
              ? new Date().getFullYear() -
                new Date(currentUser?.dob).getFullYear()
              : "N/A"}
          </h3>
          {/* <div className="flex items-center gap-1 text-sm">
            <span>{currentUser.location}</span>
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
          <button
            className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg transform transition hover:scale-105"
            onClick={handlePreviousUser}
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </button>

          <Interest
                  currentUserId={userInfo?.id}
                  currentUserName={userInfo?.username}
                  targetUserId={currentUser?._id}
          />

          <button
            className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg transform transition hover:scale-105"
            onClick={handleNextUser}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userDetails={currentUser}
        onBlock={handleBlockUser}
        onReport={handleReportUser}
      />
    </div>
  );
};

export default ProfileCard;
