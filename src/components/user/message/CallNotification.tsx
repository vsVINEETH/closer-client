'use client'
import { useSocket } from '@/context/SocketContext2'
import React from 'react'
import { MdCall, MdCallEnd } from "react-icons/md";

export default function CallNotification() {
    const { ongoingCall, handleJoinCall, handleHangup } = useSocket();
    if (!ongoingCall?.isRinging) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[320px] sm:w-[400px] rounded-2xl shadow-lg p-6 flex flex-col items-center animate-fadeIn">
                {/* Caller Info */}
                <img
                    src={ongoingCall.participants.caller.profile.image[ongoingCall.participants.caller.profile.image.length - 1] || ''}
                    alt="Caller"
                    className="w-16 h-16 rounded-full object-cover border-4 border-gray-200"
                />
                <h3 className="text-lg font-semibold text-gray-800 mt-3">{ongoingCall.participants.caller.profile.username}</h3>
                <p className="text-gray-500 text-sm">Incoming Call...</p>

                {/* Action Buttons */}
                <div className="flex gap-6 mt-5">
                    <button 
                        onClick={() => handleJoinCall(ongoingCall)} 
                        className="w-12 h-12 bg-green-500 hover:bg-green-600 active:scale-90 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 ease-in-out hover:translate-y-[-3px]"
                    >
                        <MdCall size={26} />
                    </button>
                    <button 
                        onClick={() => handleHangup({ ongoingCall, isEmitHangUp: true, isMissed: true })} 
                        className="w-12 h-12 bg-red-500 hover:bg-red-600 active:scale-90 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 ease-in-out hover:translate-y-[-3px]"
                    >
                        <MdCallEnd size={26} />
                    </button>
                </div>
            </div>
        </div>
    );
}