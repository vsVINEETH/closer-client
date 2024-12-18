import React, { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { Flame } from "lucide-react";

interface InterestProps {
  currentUserId?: string | undefined;
  currentUserName?: string,
  targetUserId: string;
  
}

const Interest: React.FC<InterestProps> = ({currentUserId, targetUserId, currentUserName}) => {

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // socket.on('newNotification', (data) => {
    //   alert(`You have a new notification: ${data.message}`);
    // });

    return () => {
      socket.off('newNotification');
    };
  }, [socket, currentUserId]);

  const handleInterest = () => {
    if (!socket) return;

    socket.emit('notification', {
      user: targetUserId,
      interactor: currentUserId,
      type:'interest',
      message: `${currentUserName} is interested in your profile!`,
    });
  };

  return (
    <>
        <button className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg transform transition hover:scale-105"
        onClick={handleInterest}
        >
        <Flame className="w-6 h-6 text-white" />
        </button>
     </>
  );
};

export default Interest;
