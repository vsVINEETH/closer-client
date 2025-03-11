"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X, Flame, Info, MapPin, Users } from "lucide-react";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { infoToast, successToast } from "@/utils/toasts/toast";
import { useSocket } from "@/context/SocketContext2";
import { blockConfirm, reportConfim } from "@/utils/sweet_alert/sweetAlert";
import LocationFetcher from "@/components/user/location/Geolocation";
import { useFetch } from "@/hooks/fetchHooks/useUserFetch";
import { useSecurity } from "@/hooks/crudHooks/user/useSecurity";

import AdvertisementModal from "./Advertisement";
import BlurredCard from "./BlurredCard";
import ProfileInfoModal from "../modals/ProfileInfoModal";
import { Advertisement, UserDTO } from "@/types/customTypes";

const ProfileCard: React.FC = () => {
  const [userData, setUserData] = useState<UserDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [swipeCount, setSwipeCount] = useState<number>(0);
  const [ads, setAds] = useState<Advertisement>();
  const [showingAd, setShowingAd] = useState<boolean>(false); // New state to handle ad display
  const [direction, setDirection] = useState<"left" | "right" | null>(null); // New state for transition direction
  const [hasLocation, setHasLocation] = useState<boolean>(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentUser: UserDTO = userData[currentIndex];
  // If user has images, use them; otherwise, use a placeholder
  const images = currentUser?.image?.length
    ? currentUser.image
    : ["https://img.freepik.com/free-photo/background_53876-32170.jpg"];

  const { getUsersData, getAdvertisementData } = useFetch();
  const { markReportUser, blockUser } = useSecurity();
  const router = useRouter();

  const { socket } = useSocket();

  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const isPrimeUser = userInfo?.prime?.isPrime;
  const preference = userInfo?.preferences;
  const savedLocation = localStorage.getItem("userLocation");

  const userPreferences = {
    userId: userInfo?.id,
    interestedIn: preference?.interestedIn || userInfo?.interestedIn,
    ageRange: preference?.ageRange || [18, 50],
    distance: preference?.distance || 10,
    lookingFor: preference?.lookingFor || userInfo?.lookingFor,
  };

  useEffect(() => {
    if (hasLocation) {
      fetchUsers();
    }
  }, [hasLocation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Auto-slide every 3 seconds
  
    return () => clearInterval(interval); // Cleanup
  }, [images.length]);
  

  const hasLocationFetched = (success: boolean) => {
    setHasLocation(success);
  };

  const fetchAds = async () => {
    const response = await getAdvertisementData();
    if (response.data) {
      setAds(response.data);
    }
  };

  async function fetchUsers () {
    const response = await getUsersData({
      userId: userInfo?.id,
      interestedIn: preference?.interestedIn || userInfo?.interestedIn,
      ageRange: preference?.ageRange || [18, 50],
      distance: preference?.distance || 10,
      lookingFor: preference?.lookingFor || userInfo?.lookingFor,
    });

    if (response.data) {
      setUserData(response.data);
      fetchAds();
    }
  };

    // Navigate to the next image
    const handleNextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };
  
    // Navigate to the previous image
    const handlePreviousImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    //setShowingAd(true)
    const handleNextUser = () => {
     // setShowingAd(true);

      if (currentIndex < userData.length - 1) {
        setDirection("left");

        if (swipeCount % 2 === 1 && !isPrimeUser) {
          setShowingAd(true);
          setSwipeCount((prev) => prev + 1);

          setTimeout(() => {
            setShowingAd(false);
            setCurrentIndex((prev) => prev + 1);
            setDirection(null);
          }, 15000);
        } else {
          setCurrentIndex((prev) => prev + 1);
          setSwipeCount((prev) => prev + 1);
          setTimeout(() => setDirection(null), 300);
        }
      } else {
        infoToast("No more users to show.");
      }
    };

  const handlePreviousUser = () => {
    if (!isPrimeUser) {
      infoToast("This is a prime feature");
      return;
    }
    if (currentIndex > 0) {
      setDirection("right");
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => setDirection(null), 300);
    } else {
      infoToast("You are already at the first user.");
    }
  };

  const handleBlockUser = async () => {
    const confirm = await blockConfirm(!currentUser.isBlocked);
    if (!confirm || !userInfo?.id) {
      return;
    }

    const response = await blockUser(
      currentUser?._id,
      userInfo?.id || "",
      userPreferences
    );

    if (response.data) {
      setUserData(response.data);
      successToast(`${currentUser?.username} has been blocked.`);
      setIsModalOpen(false);
      handleNextUser();
    }
  };

  const handleReportUser = async () => {
    const confirm = await reportConfim();
    if (!confirm || !userInfo?.id) return;

    const response = await markReportUser(
      currentUser?._id,
      userInfo?.id || "",
      userPreferences
    );

    if (response.data) {
      setUserData(response.data);
      successToast(`${currentUser?.username} has been reported.`);
      setIsModalOpen(false);
      handleNextUser();
    }
  };

  const handleInterest = () => {
    if (!socket) return;
    socket.emit("notification", {
      user: currentUser?._id,
      interactor: userInfo?.id,
      type: "interest",
      message: `${userInfo?.username} is interested in your profile!`,
      image: userInfo?.image,
    });
  };

  const cardVariants = {
    enter: {
      opacity: 0,
      scale: 0.95,
    },
    center: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 15 },
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      transition: { duration: 0.2 }, // Quick fade out
    },
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Previous User Card */}

      <LocationFetcher onLocationFetched={hasLocationFetched} />
     
      {currentIndex > 0 && (
        <BlurredCard user={userData[currentIndex - 1]} direction="left" />
      )}

        {/* Motion Wrapper */}
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={currentUser?._id} // Ensures smooth animation on change
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative w-80 h-[480px] mx-auto bg-black  rounded-3xl overflow-hidden shadow-lg"
          >
            { currentUser && currentUser?.username && (
              <div className="relative h-[480px] w-full overflow-hidden">
              {/* User Profile Image Carousel */}
              <AnimatePresence>
                <motion.img
                  key={currentIndex} // Ensure Framer Motion detects changes
                  src={images[currentImageIndex]}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-lg"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Info Button */}
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-r from-green-200 to-blue-300 shadow-lg flex items-center justify-center transition-transform transform hover:scale-110"
                onClick={() => setIsModalOpen(true)}
              >
                <Info className="w-6 h-6 text-white drop-shadow-md" />
              </button>

              {/* User Details */}
              <div className="absolute bottom-20 left-4 text-white mb-4">
                <h3 className="text-xl font-semibold">
                  {currentUser?.username},{" "}
                  {currentUser?.dob
                    ? new Date().getFullYear() - new Date(currentUser?.dob).getFullYear()
                    : "N/A"}
                </h3>
              </div>

              {/* Carousel Controls */}
              { images.length > 1 && (
                <>
                  {/* Previous Image Button */}
                  <motion.button
                    onClick={handlePreviousImage}
                    className="absolute top-1/2 left-4 w-10 h-10 bg-white/30 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.2 }}
                  >
                    ◀
                  </motion.button>

                  {/* Next Image Button */}
                  <motion.button
                    onClick={handleNextImage}
                    className="absolute top-1/2 right-4 w-10 h-10 bg-white/30 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.2 }}
                  >
                    ▶
                  </motion.button>
                </>
              )}

              {/* Action Buttons */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    y: -2,
                    transition: { type: "spring", stiffness: 200, damping: 12 },
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.15, ease: "easeInOut" },
                  }}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_5px_15px_rgba(255,180,0,0.5)] transition-all duration-300 ease-out"
                  onClick={handlePreviousUser}
                >
                  <RotateCcw className="w-6 h-6 text-white" />
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.1,
                    y: -2,
                    transition: { type: "spring", stiffness: 200, damping: 12 },
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.15, ease: "easeInOut" },
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-600 to-customPink flex items-center justify-center shadow-[0_5px_20px_rgba(255,0,100,0.5)] transition-all duration-300 ease-out"
                  onClick={handleInterest}
                >
                  <Flame className="w-7 h-7 text-white" />
                </motion.button>

                <motion.button
                  whileHover={{
                    scale: 1.1,
                    y: -2,
                    transition: { type: "spring", stiffness: 200, damping: 12 },
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.15, ease: "easeInOut" },
                  }}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-[0_5px_15px_rgba(100,100,255,0.5)] transition-all "
                  onClick={handleNextUser}
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </div>
            )}

          {!hasLocation && !savedLocation  &&(
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl text-white p-6 text-center"
            >
              <MapPin className="w-12 h-12 text-red-400 mb-2 animate-bounce" />
              <p className="text-lg font-semibold">Location Permission Required</p>
              <p className="text-sm opacity-80">
                Please allow location access to find matches near you.
              </p>
            </motion.div>
          )}

          {hasLocation && userData.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl text-white p-6 text-center"
            >
              <Users className="w-12 h-12 text-blue-400 mb-2 animate-pulse" />
              <p className="text-lg font-semibold">No Users Found</p>
              <p className="text-sm opacity-80">
                Update your preferences to discover new people.
              </p>
              <button
                onClick={() => router.push('/user/profile')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                Update Preferences
              </button>
            </motion.div>
          )}

          </motion.div>
        </AnimatePresence>

      {/* Next User Card */}
      {currentIndex < userData.length - 1 && (
        <BlurredCard user={userData[currentIndex + 1]} direction="right" />
      )}

      {/* Modal */}
      <ProfileInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userDetails={currentUser}
        onBlock={handleBlockUser}
        onReport={handleReportUser}
      />

      <AdvertisementModal
        isOpen={showingAd}
        onClose={() => setShowingAd(false)}
        advertisement={ads}
      />
    </div>
  );
};

export default ProfileCard;
