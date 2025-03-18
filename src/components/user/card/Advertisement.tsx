'use client'
import React, { useEffect, useMemo } from "react";
import { Advertisement } from "@/types/customTypes";

const AdvertisementModal: React.FC<{ 
  isOpen: boolean; 
  advertisement: Advertisement | undefined; 
  onClose: () => void; 
}> = ({ isOpen, advertisement, onClose }) => {
  if (!isOpen || !advertisement || advertisement.advertisement.length === 0) return null;

  // Generate a random index for advertisement selection
  const randomIndex = useMemo(() => 
    Math.floor(Math.random() * advertisement.advertisement.length), 
    [advertisement]
  );

  const randomAd = advertisement.advertisement[randomIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Automatically close after 15 seconds
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-lg transform transition-all scale-100">
        
        {/* Image Section */}
        {randomAd?.image?.length > 0 && (
          <img
            src={randomAd.image[0]} 
            alt={randomAd.title}
            className="w-full h-48 object-cover rounded-lg shadow-md mb-4"
          />
        )}

        {/* Content */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{randomAd.title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{randomAd.subtitle}</p>
        <p className="text-gray-700 dark:text-gray-400">{randomAd.content}</p>
      </div>
    </div>
  );
};

export default AdvertisementModal;
