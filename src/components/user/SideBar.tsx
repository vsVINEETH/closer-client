"use client";
import React, { useEffect, useState } from "react";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import Link from "next/link";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { successToast } from "@/utils/toasts/toast";
import { useRouter } from "next/navigation";
import { useSocket} from "@/context/SocketContext2";
import { useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetch } from "@/hooks/fetchHooks/useUserFetch";
import { useTranslations } from "next-intl";


interface MenuItem {
  href: string;
  text: string;
  key: string;
}



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

interface Messages {
  pair: string,
  messages:{
    messages:{
      createdAt: string, 
      isRead: boolean,
      message: string,
      receiver: string,
      sender: string,
      type: string,
      updatedAt: string,
     _id: string,
    }[],
    unreadCount: number
  },
  unreadCount: number
}

const SideBar: React.FC = () => {
  const t = useTranslations('Sidebar');
  const menuItems: MenuItem[] = [
    { href: "#", text: t('matches'), key: 'matches'},
    { href: "#", text: t('messages'), key: 'messages'},
    { href: "#", text: t('notifications'), key:'notifications' },
  ];
  const searchParams = useSearchParams();
  const oppositeUserId = searchParams.get('id');
  const pathname = usePathname();

  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [matches, setMatches] = useState<MatchedUsers[]>([])
  // () => {
  //   const storedMatches = localStorage.getItem('matches');
  //   return storedMatches ? JSON.parse(storedMatches) : [];
  // });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('currentTab') || 'matches';
  });
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
   const {getNotifications, getMessages, getMatches, interestOnUser, unmatchUser} = useFetch()
  const { socket, receivedMessage } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (receivedMessage) {

      const currentUrl = searchParams.toString()
      ? `${pathname}/?${searchParams.toString()}`
      : pathname;
      const expectedUrl = `/user/chat/?id=${String(oppositeUserId)}`;

      setMessages((prevMessages = []) => { 
        const updatedMessages = [...prevMessages];
      
        const senderId = receivedMessage.sender;
        const receiverId = receivedMessage.receiver._id; 
        const pairKey = [senderId, receiverId].sort().join("-");
      
        const existingIndex = updatedMessages.findIndex((msg) => msg.pair === pairKey);
      
        const formattedMessage = {
          _id: receivedMessage._id ?? "",
          createdAt: receivedMessage.createdAt,
          isRead: currentUrl === expectedUrl ? true : receivedMessage.isRead,
          message: receivedMessage.message,
          receiver: receiverId,
          sender: senderId,
          type: receivedMessage.type,
          updatedAt: receivedMessage.createdAt,
        };
      
        if (existingIndex !== -1) {
          const existingMessages = updatedMessages[existingIndex].messages.messages;
        if (!existingMessages.some((msg) => msg._id === formattedMessage._id)) {
          updatedMessages[existingIndex] = {
            ...updatedMessages[existingIndex],
            messages: {
              messages: [...updatedMessages[existingIndex].messages.messages, formattedMessage],
              unreadCount: currentUrl === expectedUrl ? 0 
                : receivedMessage.isRead
                ? updatedMessages[existingIndex].messages.unreadCount
                : updatedMessages[existingIndex].messages.unreadCount + 1,
            },
          };
         }
        } else {
          updatedMessages.push({
            pair: pairKey,
            messages: {
              messages: [formattedMessage],
              unreadCount: currentUrl === expectedUrl ? 0 : (receivedMessage.isRead ? 0 : 1),
            },
            unreadCount: currentUrl === expectedUrl ? 0 : (receivedMessage.isRead ? 0 : 1),
          });
        }
      
        return updatedMessages;
      });
      
    }
  }, [receivedMessage]);
  
  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", (payload: { data: Notification }) => {
      const { data } = payload;
      setNotifications((prev) => [...prev, data]);
      setActiveTab("notifications");
      playNotificationSound();
    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket]);

  useEffect(() => {
    fetchData();
   localStorage.setItem('currentTab', activeTab);
   localStorage.setItem('matches', JSON.stringify(matches));
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
      const width = window.innerWidth;
      if (width >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    // Set initial width
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array means this only runs on mount and unmount

  const toggleSidebar = () => {
    const width = window.innerWidth;
    if (width < 1024) {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine"; // You can change this to "square", "triangle", or "sawtooth", "sine" for different sounds
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequency in Hz (440 = A4)

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Adjust volume
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3); // Play sound for 0.2 seconds
  };

  const fetchNotifications = async () => {
    if(!userInfo?.id) return;
    const response = await getNotifications(userInfo?.id);

    if (response.data) {
      console.log(response.data);
      setNotifications(response.data);
    }
  };

  const fetchMessages = async () => {
    if(!userInfo?.id) return;
    const response = await getMessages(userInfo?.id)

    if (response.data) {
      setMessages(response.data.messages);
    }
  };

  const fetchMatches = async () => {
    if(!userInfo?.id) return;
    const response = await getMatches(userInfo.id);

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
    notificationId: string,
    interactorId: string
  ) => {
    if(!userInfo?.id) return;
    const response = await interestOnUser(notificationId, userInfo?.id, interactorId, status)

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
    if(!userInfo?.id) return;
    const response = await unmatchUser(userInfo?.id, interactorId)

    if(response.data){
      console.log(response.data)
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "notifications":
        return notifications.length ? (
      <div className="p-4 space-y-4">
        <AnimatePresence>
          {notifications.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between p-4 bg-gray-100 dark:bg-darkGray rounded-md shadow-md"
            >
              <p className="text-gray-700 dark:text-white">{item.message}</p>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAcceptNotification(index, item.id, item.interactor)}
                  className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Accept
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRejectNotification(index, item.id, item.interactor)}
                  className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Reject
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
        ) : (
          <p className="p-4 text-gray-600">No notifications yet.</p>
        );
        case "messages":
          return messages ? (
            <div className="p-4 space-y-4">
            <AnimatePresence>
              {matches?.length > 0 ? (
                matches?.map((match) => {
                  const relevantMessages = messages.filter(
                    (val) =>
                      val.pair === `${match._id}-${userInfo?.id}` ||
                      val.pair === `${userInfo?.id}-${match._id}`
                  );
      
                  const latestMessage =
                    relevantMessages.length > 0
                      ? relevantMessages[relevantMessages.length - 1]
                      : null;
      
                  const lastMessage = latestMessage ? latestMessage?.messages?.messages : null;
      
                  return (
                    <motion.div
                      key={match._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-4 bg-gray-100 dark:bg-darkGray rounded-lg shadow-md transition-all duration-200 hover:bg-gray-200 dark:hover:bg-black cursor-pointer"
                      onClick={() => router.push(`/user/chat/?id=${match._id}`)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={match?.image[0] || "/default-avatar.png"}
                          alt={`${match?.username}'s avatar`}
                          className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                        />
                        <div className="flex flex-col">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {match?.username}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-40">
                            {lastMessage ? lastMessage[lastMessage.length - 1]?.message : "Tap to start conversation"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {latestMessage?.messages?.unreadCount ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full"
                          >
                            {latestMessage.messages.unreadCount}
                          </motion.span>
                        ) : null}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {lastMessage
                            ? new Date(lastMessage[lastMessage.length - 1]?.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p className="p-4 text-center text-gray-600 dark:text-gray-400">No messages yet.</p>
              )}
            </AnimatePresence>
          </div>
          ) : (
            <p className="p-4 text-center text-gray-600 dark:text-gray-400">
              No messages yet.
            </p>
          );
        
        case "matches":
        return matches?.length ? (
          <div className="p-4 space-y-4">
          <AnimatePresence>
            {matches?.map((match) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-darkGray rounded-md shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.img
                    src={match?.image[0] || "/default-avatar.png"}
                    alt={`${match.username}'s avatar`}
                    className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <p className="font-bold text-gray-700 dark:text-white">{match.username}</p>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    className="px-2 py-1 text-sm font-medium text-white bg-customPink rounded hover:bg-customPink"
                    onClick={() => router.push(`/user/chat/?id=${match._id}`)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Chat
                  </motion.button>
                  <motion.button
                    className="px-2 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                    onClick={() => handleUnmatch(match._id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Unmatch
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
    {screenWidth < 1024 && (
      <motion.button
        onClick={toggleSidebar}
        className={`fixed top-16 left-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-nightBlack border border-gray-300 shadow-lg ${
          isSidebarOpen ? "hidden" : ""
        }`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HiArrowRight className="text-base text-gray-700 dark:text-white" />
      </motion.button>
    )}
    {/* Sidebar */}
    <motion.aside
      className={`sm:block fixed top-16 left-0 z-40 min-h-[calc(100vh-64px)] w-72 transform border-r dark:border-gray-800 flex-shrink-0 border-gray-300 bg-white dark:bg-nightBlack lg:static lg:min-h-full lg:w-96 lg:block`}
      initial={{ x: '-100%' }}
      animate={{ x: isSidebarOpen ? '0%' : '-100%' }}
      transition={{ type: "tween", duration: 0.3 }}
    >
      {/* Profile Section */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <motion.img
          src={userInfo?.image && userInfo?.image[0]}
          alt="User Avatar"
          className="w-10 h-10 rounded-full flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        <Link
          href="/user/profile"
          className="font-medium text-black dark:text-white"
        >
          {userInfo?.username}
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="py-4 flex flex-col space-y-2 lg:flex-row lg:space-x-4 lg:justify-start lg:px-4 flex-wrap">
      {menuItems.map((item) => (
        <motion.button
          key={item.key}
          onClick={() => setActiveTab(item.key)}
          className={`inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:hover:text-gray-400 dark:text-lightGray 
            ${activeTab === item.key ? "font-bold text-black dark:text-white" : ""} 
            max-w-full break-words`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {item.text}
        </motion.button>

        ))}
      </nav>

      {/* Content Area */}
      <motion.div className="content-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {renderContent()}
      </motion.div>
    </motion.aside>

    {/* Arrow Button for Closing Sidebar */}
    {screenWidth < 1024 && (
      <motion.button
        onClick={toggleSidebar}
        className={`fixed top-16 left-72 z-50 p-2 rounded-full bg-gray-200 dark:bg-nightBlack border border-gray-300 shadow-lg ${
          isSidebarOpen ? "" : "hidden"
        }`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HiArrowLeft className="text-base text-gray-700 dark:text-white" />
      </motion.button>
    )}
  </div>
  );
};

export default SideBar;
