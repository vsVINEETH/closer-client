"use client";
import React, { useEffect, useState } from "react";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import Link from "next/link";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { useSocket } from "@/context/SocketContext";
import useAxios from "@/hooks/useAxios/useAxios";
import { errorToast, successToast } from "@/utils/toasts/toats";
import { useRouter } from "next/navigation";

interface MenuItem {
  href: string;
  text: string;
  key: string; // Key to identify the menu item
}

const menuItems: MenuItem[] = [
  { href: "#", text: "Matches", key: "matches" },
  { href: "#", text: "Messages", key: "messages" },
  { href: "#", text: "Notifications", key: "notifications" },
];

interface Notification {
  id: string;
  user: string;
  interactor: string;
  type: string;
  message: string;
  createdAt: string;
}

interface MatchedUsers {
  _id: string;
  username: string;
  email: string;
  image: string;
}

const SideBar: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<string[]>([
    "Hello!",
    "How are you?",
  ]);
  const [matches, setMatches] = useState<MatchedUsers[]>([]);
  const [activeTab, setActiveTab] = useState<string>("matches"); 
  const { handleRequest } = useAxios();
  const { socket } = useSocket();

  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", (payload: { data: Notification }) => {
      const { data } = payload;
      setNotifications((prev) => [...prev, data]);
      setActiveTab("notifications");
    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket]);


  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchNotifications = async () => {
    const response = await handleRequest({
      url: "/api/user/notifications",
      method: "GET",
      params: {
        id: userInfo?.id,
      },
    });

    if (response.error) {
      errorToast(response.error);
    }

    if (response.data) {
      console.log(response.data);
      setNotifications(response.data);
      // setNotify(response.data);
    }
  };

  const fetchMessages = async () => {
    const response = await handleRequest({
      url: "/api/user/messages",
      method: "GET",
      params: {
        id: userInfo?.id,
      },
    });

    if (response.error) {
      errorToast(response.error);
    }

    if (response.data) {
      setMessages(response.data);
    }
  };

  const fetchMatches = async () => {
    const response = await handleRequest({
      url: "/api/user/matches",
      method: "GET",
      params: {
        id: userInfo?.id,
      },
    });

    if (response.error) {
      errorToast(response.error);
    }

    if (response.data) {
      setMatches(response.data.matches);
    }
  };

  const fetchData = async () => {
    switch (activeTab) {
      case "notifications":
        fetchNotifications();
        return;
      case "messages":
        fetchMessages();
        return;
      case "matches":
        fetchMatches();
    }
  };

  const handleInterest = async (
    status: boolean,
    id: string,
    interactorId: string
  ) => {
    const response = await handleRequest({
      url: "/api/user/interest_request",
      method: "POST",
      data: {
        id: id,
        userId: userInfo?.id,
        interactorId: interactorId,
        status: status,
      },
    });

    if (response.error) {
      errorToast("something happend");
    }

    if (response.data) {
      successToast("done");
    }
  };

  const handleAcceptNotification = async (
    index: number,
    id: string,
    interactorId: string
  ) => {
    await handleInterest(true, id, interactorId);
    setNotifications((prev) => prev.filter((_, i) => i !== index)); // Remove accepted notification
  };

  const handleRejectNotification = async (
    index: number,
    id: string,
    interactorId: string
  ) => {
    await handleInterest(false, id, interactorId);
    setNotifications((prev) => prev.filter((_, i) => i !== index)); // Remove rejected notification
  };


  const handleUnmatch = async (interactorId: string) => {
    const response = await handleRequest({
      url:"/api/user/unmatch",
      method:'PATCH',
      data:{
        userId: userInfo?.id,
        interactorId: interactorId,
      }
    });

    if(response.error){
      errorToast(response.error);
    }

    if(response.data){
      console.log(response.data)
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "notifications":
        return notifications.length ? (
          <div className="p-4 space-y-4">
            {notifications.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md"
              >
                <p className="text-gray-700 dark:text-white">{item.message}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handleAcceptNotification(index, item.id, item.interactor)
                    }
                    className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      handleRejectNotification(index, item.id, item.interactor)
                    }
                    className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-gray-600">No notifications yet.</p>
        );
      case "messages":
        return messages.length ? (
          <div className="p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md"
              >
                {/* Example username, you can replace it with actual username logic */}
                <p className="font-bold text-gray-700 dark:text-white">
                  User {index + 1}
                </p>
                <p className="text-gray-600 dark:text-gray-400">{msg}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-gray-600">No messages yet.</p>
        );
      case "matches":
        return matches.length ? (
          <div className="p-4 space-y-4">
            {matches.map((match, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md"
              >
                <div className="flex items-center space-x-4">
                  {/* Image Section */}
                  <img
                    src={match?.image[0] || "/default-avatar.png"} // Fallback to default avatar if image is not provided
                    alt={`${match.username}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {/* Username Section */}
                  <p className="font-bold text-gray-700 dark:text-white">
                    {match.username}
                  </p>
                  {/* <span className='text-xs'> click to start a converstaion</span> */}
                </div>
                <div>
                  <button
                    className="px-1 py-1 text-sm font-medium text-white bg-customPink rounded hover:bg-customPink"
                    onClick={() =>
                    router.push(`/user/chat/?id=${match._id}`)
                    }
                  >
                    Chat
                  </button>

                  <button
                    className="px-1 py-1 ml-1 text-sm font-medium text-white bg-customPink rounded hover:bg-customPink"
                    onClick={() =>
                      handleUnmatch(match._id)
                    } 
                  >
                    unmatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-gray-600">No matches yet.</p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="lg:w-96">
      {/* Arrow Button for Opening Sidebar */}
      <button
        onClick={toggleSidebar}
        className={`lg:hidden fixed top-16 left-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-nightBlack border border-gray-300 shadow-lg ${
          isSidebarOpen ? "hidden" : ""
        }`}
      >
        <HiArrowRight className="text-lg text-gray-700 dark:text-white" />
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:block fixed top-16 left-0 z-40 min-h-[calc(100vh-64px)] w-72 transform border-r dark:border-gray-800 flex-shrink-0 border-gray-300 bg-white dark:bg-nightBlack transition-all duration-300 ease-in-out lg:static lg:min-h-full lg:w-96 lg:block`}
      >
        {/* Profile Section */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <img
            src={userInfo?.image && userInfo?.image[0]}
            alt="User Avatar"
            className="w-10 h-10 rounded-full flex items-center justify-center"
          />
          <Link
            href="/user/profile"
            className="font-medium text-black dark:text-white"
          >
            {userInfo?.username}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="py-4 flex flex-col space-y-2 lg:flex-row lg:space-x-4 lg:justify-start lg:px-4">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`block px-4 py-2 text-gray-600 hover:text-gray-900 dark:hover:text-gray-400 dark:text-lightGray ${
                activeTab === item.key
                  ? "font-bold text-black dark:text-white"
                  : ""
              }`}
            >
              {item.text}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="content-area">{renderContent()}</div>
      </aside>

      {/* Arrow Button for Closing Sidebar */}
      <button
        onClick={toggleSidebar}
        className={`lg:hidden fixed top-16 left-72 z-50 p-2 rounded-full bg-gray-200 dark:bg-nightBlack border border-gray-300 shadow-lg ${
          isSidebarOpen ? "" : "hidden"
        }`}
      >
        <HiArrowLeft className="text-lg text-gray-700 dark:text-white" />
      </button>
    </div>
  );
};

export default SideBar;
