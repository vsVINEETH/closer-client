'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC/useWebRTC';
import { useSocket } from '@/context/SocketContext';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import { Rnd } from 'react-rnd';

interface VideoCallProps {
  recipientId: string;
  setCallVideoActive: Function;
}

export default function VideoCall({ recipientId, setCallVideoActive }: VideoCallProps) {
  const {
    localStream,
    remoteStream,
    isCallActive,
    isCallIncoming,
    callerId,
    startLocalStream,
    initiateCall,
    endCall,
  } = useWebRTC();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('Binding remote stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleStartCall = async () => {
    await startLocalStream();
    await initiateCall(recipientId);
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !isVideoEnabled));
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !isAudioEnabled));
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handleAnswerCall = async () => {
    await startLocalStream();
  };

  const endupCall = () => {
    endCall();
    setCallVideoActive(false);
  };

  return (
    <Rnd
      default={{
        x: 100,
        y: 100,
        width: 400,
        height: 300,
      }}
      bounds="window"
      lockAspectRatio
      minWidth={200}
      minHeight={150}
      className="bg-gray-100 shadow-lg rounded-lg border border-gray-300 overflow-hidden"
    >
      <div className="flex flex-col items-center justify-center p-4">
        {isCallIncoming && (
          <div className="call-notification">
            <p>Incoming call from {callerId}</p>
            <button  onClick={handleAnswerCall} className="bg-green-500 text-white px-4 py-2 rounded-lg">
              Answer
            </button>
            <button onClick={endupCall} className="bg-red-500 text-white px-4 py-2 rounded-lg">
              Reject
            </button>
          </div>
        )}

        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Waiting for connection...
            </div>
          )}
          <div className="absolute bottom-4 right-4 w-1/4 aspect-video">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-lg"></video>
          </div>
        </div>

        <div className="flex space-x-4">
          {!isCallActive ? (
            <button
              onClick={handleStartCall}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Start Call
            </button>
          ) : (
            <>
              <button onClick={toggleVideo} className="text-gray-700 hover:text-gray-900">
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </button>
              <button onClick={toggleAudio} className="text-gray-700 hover:text-gray-900">
                {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </button>
              <button onClick={endupCall} className="text-red-500 hover:text-red-700">
                <PhoneOff className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </Rnd>
  );
}
