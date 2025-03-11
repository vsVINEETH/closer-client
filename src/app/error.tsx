"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {/* Error Icon */}
      <motion.div
        className="bg-red-100 p-4 rounded-full shadow-md"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <AlertTriangle className="w-16 h-16 text-red-600" />
      </motion.div>

      {/* Error Message */}
      <motion.h1
        className="text-4xl font-bold text-red-600 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Oops! Something went wrong
      </motion.h1>
      <p className="text-gray-700 mt-3">We apologize for the inconvenience.</p>
      <p className="text-gray-500 mt-2 italic">{error.message}</p>

      {/* Action Buttons */}
      <motion.div
        className="flex gap-4 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => reset()}
          className="px-6 py-2 flex items-center gap-2 bg-customPink text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          <RefreshCcw className="w-5 h-5" />
          Retry
        </button>

        <button
          onClick={() => router.back()}
          className="px-6 py-2 flex items-center gap-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all"
        >
          <Home className="w-5 h-5" />
          Go Back
        </button>
      </motion.div>
    </motion.div>
  );
}
