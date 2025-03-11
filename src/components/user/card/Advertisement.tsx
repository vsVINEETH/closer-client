'use client'
import React,{useEffect} from "react";
import { Advertisement } from "@/types/customTypes";

const AdvertisementModal: React.FC<{ isOpen: boolean; advertisement: Advertisement | undefined; onClose: () => void }> = ({ isOpen, advertisement, onClose }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Automatically close after 15 seconds
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-lg transform transition-all scale-100">
        {/* Close Button */}
        {/* <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition"
          onClick={onClose}
        >
          <X size={24} />
        </button> */}

        {/* Image Section */}
        {advertisement && advertisement?.advertisement[0]?.image?.length > 0 && (
          <img
            src={advertisement?.advertisement[0]?.image[0]} 
            alt={advertisement?.advertisement[0]?.title}
            className="w-full h-48 object-cover rounded-lg shadow-md mb-4"
          />
        )}

        {/* Content */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{advertisement?.advertisement[0]?.title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{advertisement?.advertisement[0]?.subtitle}</p>
        <p className="text-gray-700 dark:text-gray-400">{advertisement?.advertisement[0]?.content}</p>
      </div>
    </div>
  );
};


export default AdvertisementModal;