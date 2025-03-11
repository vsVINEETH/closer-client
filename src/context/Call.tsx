'use client'
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { useSocket } from '@/context/SocketContext';

interface CallContextProps {
  callState: {
    receivingCall: boolean;
    caller: string | null;
    callerSignal: any;
    callAccepted: boolean;
    callEnded: boolean;
  };
  answerCall: () => void;
  rejectCall: () => void;
  leaveCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

const CallContext = createContext<CallContextProps | null>(null);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stream, setStream] = useState<MediaStream>();
  const [callState, setCallState] = useState({
    receivingCall: false,
    caller: null,
    callerSignal: '',
    callAccepted: false,
    callEnded: false,
  });
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const { socket } = useSocket();
  const connectionRef = useRef<any>();
  const remoteStreamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => setStream(stream))
      .catch((error) => console.error('Error accessing media devices:', error));

    socket?.on('callUser', (data) => {
      setCallState({
        receivingCall: true,
        caller: data.from,
        callerSignal: data.signal,
        callAccepted: false,
        callEnded: false,
      });
    });

    socket?.on('callRejected', () => {
      setCallState((prev) => ({ ...prev, callEnded: true, receivingCall: false }));
    });
  }, []);

  const answerCall = () => {
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket?.emit('answerCall', { signal: data, id: callState.caller });
    });

    peer.on('stream', (remoteStream) => {
      if (remoteStreamRef.current) remoteStreamRef.current.srcObject = remoteStream;
    });

    peer.signal(callState.callerSignal);
    connectionRef.current = peer;

    setCallState((prev) => ({ ...prev, callAccepted: true }));
  };

  const rejectCall = () => {
    socket?.emit('rejectCall', { id: callState.caller });
    setCallState((prev) => ({ ...prev, receivingCall: false }));
  };

  const leaveCall = () => {
    setCallState((prev) => ({ ...prev, callAccepted: false, callEnded: true }));
    connectionRef.current?.destroy();
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !isVideoEnabled;
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !isAudioEnabled;
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        answerCall,
        rejectCall,
        leaveCall,
        toggleVideo,
        toggleAudio,
        isVideoEnabled,
        isAudioEnabled,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
