"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLoading } from "@/context/LoadingContext";

export default function Loading() {
  const { isLoading } = useLoading();

  if (!isLoading) return null; // Hide if not loading

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-md z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <h1 className="text-lg font-semibold text-gray-700 mt-2">Loading...</h1>
      </motion.div>
    </div>
  );
}
