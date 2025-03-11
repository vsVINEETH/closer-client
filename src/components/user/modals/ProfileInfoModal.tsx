"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion";
import {  X, Calendar, Search, Heart  } from "lucide-react";
import { UserDTO } from "@/types/customTypes"

const ProfileInfoModal: React.FC<{
    isOpen: boolean
    onClose: () => void
    userDetails: UserDTO
    onBlock: () => void
    onReport: () => void
  }> = ({ isOpen, onClose, userDetails, onBlock, onReport }) => {
    if (!isOpen) return null
  
    return (
      
  <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background decoration */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-customPink to-customPink opacity-20" />
  
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
  
              {/* User avatar */}
              <div className="relative mb-6 flex justify-center">
                <img
                  src={userDetails?.image?.[0] || "/placeholder.svg?height=100&width=100"}
                  alt={userDetails?.username || "User"}
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                />
              </div>
  
              {/* User Details */}
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
                  {userDetails?.username || "User"}
                </h2>
                {[
                  { icon: Calendar, label: "Birthday", value: userDetails?.dob },
                  { icon: Search, label: "Looking For", value: userDetails?.lookingFor },
                  { icon: Heart, label: "Interested In", value: userDetails?.interestedIn },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <item.icon className="w-5 h-5 text-customPink" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                      <p className="font-medium">{item.value || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Action Buttons */}
              <div className="mt-8 flex justify-between gap-4">
                <button
                  onClick={onBlock}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                >
                  Block
                </button>
                <button
                  onClick={onReport}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-lg hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                >
                  Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

export default ProfileInfoModal;