'use client'
import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdCallEnd } from "react-icons/md";
import { OngoingCall } from "@/context/SocketContext2";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface iVideoContainer {
    stream: MediaStream | null;
    isLocalStream: boolean;
    isOnCall: boolean;
    toggleMic: () => void;
    toggleCamera: () => void;
    handleHangup: ({}) => void;
    ongoingCall: OngoingCall | null;
    isMicOn: boolean;
    isVidOn: boolean;
    isVoiceCall: boolean;
    peerStream: any;
}

const VideoContainer = ({ 
    stream, 
    isLocalStream, 
    toggleMic, 
    toggleCamera, 
    isMicOn, 
    isVidOn, 
    peerStream, 
    handleHangup, 
    ongoingCall, 
    isVoiceCall 
}: iVideoContainer) => {
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const remoteRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);
    const user = useSelector((state: RootState) => state?.user.userInfo);

    const [position, setPosition] = useState({ x: 0, y: 0 });

    // Center the video container on mount
    useEffect(() => {
      if (typeof window !== "undefined") {
          const centerX = (window.innerWidth - 400) / 2;
          const centerY = (window.innerHeight - 300) / 2;
          setPosition({ x: centerX, y: centerY });
      }
    }, []);

    useEffect(() => {
        if (videoRef.current && stream && !isVoiceCall) {
            videoRef.current.srcObject = stream;
        } else if (audioRef.current) {
            audioRef.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        if (remoteRef.current && peerStream) {
            remoteRef.current.srcObject = peerStream;
        } else if (remoteAudioRef.current && peerStream) {
            remoteAudioRef.current.srcObject = peerStream;
        }
    }, [peerStream]);

   return (
      <Rnd
          position={position}
          onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
          bounds="window"
          lockAspectRatio={!isVoiceCall}
          minWidth={isVoiceCall ? "auto" : 250}
          minHeight={isVoiceCall ? "auto" : 150}
          enableResizing={!isVoiceCall}
          className="bg-gray-100 shadow-lg rounded-lg border border-gray-300 overflow-hidden z-50"
      >
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
            {/* Main Call Container */}
            <div
                className={`relative w-full ${
                    isVoiceCall ? "h-auto" : "aspect-video"
                } rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center`}
            >
                {/* Voice Call UI */}
                {isVoiceCall && ongoingCall && (
                    <div className="bg-white min-w-[320px] min-h-[120px] flex flex-col items-center justify-center rounded-lg p-5 shadow-md">
                        <img
                            src={
                                ongoingCall.participants.caller.userId === user?.id
                                    ? ongoingCall.participants.receiver.profile.image.slice(-1)[0]
                                    : ongoingCall.participants.caller.profile.image.slice(-1)[0]
                            }
                            alt="User Avatar"
                            className="w-16 h-16 rounded-full object-cover shadow-md"
                        />
                        <h1 className="text-lg font-semibold mt-3 text-gray-800">
                            {ongoingCall.participants.caller.userId === user?.id
                                ? ongoingCall.participants.receiver.profile.username
                                : ongoingCall.participants.caller.profile.username}
                        </h1>
                    </div>
                )}

                {/* Audio Elements */}
                {isVoiceCall && <audio ref={audioRef} autoPlay playsInline muted={isLocalStream} />}
                {isVoiceCall && <audio ref={remoteAudioRef} autoPlay playsInline muted={!isLocalStream} />}

                {/* Video Call UI (Only show if it's NOT a voice call) */}
                {!isVoiceCall && (
                    <>
                        <video ref={remoteRef} autoPlay playsInline muted={!isLocalStream} className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 right-4 w-24 aspect-video shadow-lg rounded-lg overflow-hidden border border-gray-400">
                            <video className="rounded-lg w-full" ref={videoRef} autoPlay playsInline muted={isLocalStream} />
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="flex space-x-6 items-center">
                <button onClick={toggleMic} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 shadow-md transition">
                    {!isMicOn ? <MdMic size={28} className="text-gray-700" /> : <MdMicOff size={28} className="text-red-500" />}
                </button>

                <button
                    className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-red-600 transition"
                    onClick={() =>
                        handleHangup({ ongoingCall: ongoingCall ? ongoingCall : undefined, isEmitHangUp: true, isMissed: false })
                    }
                >
                    <MdCallEnd size={28} />
                </button>

                {!isVoiceCall && (
                    <button onClick={toggleCamera} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 shadow-md transition">
                        {!isVidOn ? <MdVideocam size={28} className="text-gray-700" /> : <MdVideocamOff size={28} className="text-red-500" />}
                    </button>
                )}
            </div>
        </div>
    </Rnd>
    );
};

export default VideoContainer;


// 'use client'
// import React,{useEffect, useRef} from 'react'
// import { Rnd } from 'react-rnd';
// import { MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdCallEnd } from "react-icons/md";
// import { OngoingCall } from '@/context/SocketContext2';
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";

// interface iVideoContainer {
//     stream: MediaStream | null,
//     isLocalStream: boolean,
//     isOnCall: boolean,
//     toggleMic: () => void,
//     toggleCamera: () => void,
//     handleHangup: ({}) => void,
//     ongoingCall: OngoingCall | null,
//     isMicOn: boolean,
//     isVidOn: boolean,
//     isVoiceCall: boolean,
//     peerStream: any,
// }

// const VideoContainer = ({stream, isLocalStream, isOnCall, toggleMic, toggleCamera, isMicOn, isVidOn, peerStream, handleHangup, ongoingCall, isVoiceCall}: iVideoContainer) => {
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const remoteRef = useRef<HTMLVideoElement>(null);
//     const audioRef = useRef<HTMLAudioElement>(null);
//     const remoteAudioRef = useRef<HTMLAudioElement>(null);
//     const user = useSelector((state: RootState) => state?.user.userInfo);

//     useEffect(() => {
//         if(videoRef.current && stream && !isVoiceCall){
//             videoRef.current.srcObject = stream;
//         }else if(audioRef.current){
//           audioRef.current.srcObject = stream
//         }
//     },[stream]);


//     useEffect(() => {
//         if(remoteRef.current && peerStream){
//             remoteRef.current.srcObject = peerStream
//           }else if( remoteAudioRef.current && peerStream){
//             remoteAudioRef.current.srcObject = peerStream
//           }
//     }, [peerStream]);

//      return (
//         <Rnd
//           default={{
//             x: 100,
//             y: 100,
//             width: 400,
//             height: 300,
//           }}
//           bounds="window"
//           lockAspectRatio
//           minWidth={200}
//           minHeight={150}
//           className="bg-gray-100 shadow-lg rounded-lg border border-gray-300 overflow-hidden"
//         >
//           <div className="flex flex-col items-center justify-center p-4">

//             <div className="relative w-full aspect-video  rounded-lg overflow-hidden">
//             {isVoiceCall && ongoingCall &&
//             <div className='bg-gray-100 min-w-[300px] min-h-[100px] flex flex-col items-center justify-center rounded p-4'>
//              <h1 className='text-center font-semibold'>{ongoingCall.participants.caller.userId === user?.id ? ongoingCall.participants.receiver.profile.username : ongoingCall.participants.caller.profile.username}</h1>
//              <img src={ongoingCall.participants.caller.userId === user?.id ? ongoingCall.participants.receiver.profile.image[ongoingCall.participants.receiver.profile.image.length -1 ] : ongoingCall.participants.caller.profile.image[ongoingCall.participants.caller.profile.image.length-1]} alt=""  className="w-12 h-12 rounded-full object-cover"/>
//             </div>
//             }

//               {isVoiceCall && 
//               <audio ref={audioRef} autoPlay playsInline muted={isLocalStream}/>
//               }
//               {isVoiceCall &&
//               <audio ref={remoteAudioRef} autoPlay playsInline muted={!isLocalStream}></audio>
//               }
              
//               {   !isVoiceCall &&        
//               <video ref={remoteRef} autoPlay playsInline muted={!isLocalStream} className="w-full h-full object-cover"></video>
//               }
//               <div className="absolute bottom-4 right-4 w-1/4 aspect-video">
//               {  !isVoiceCall &&              
//               <video className="rounde border w-[200px]" ref={videoRef} autoPlay playsInline muted={isLocalStream}/>
//               }            
//                </div>
//             </div>
    
//             <div className="flex space-x-4 mt-5 items-center ">
//                 <button onClick={toggleMic}>
//                  {!isMicOn ? <MdMic size={28}/> : <MdMicOff size={28}/>}
//                 </button>
                 
//                 <button className='w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white'
//                 onClick={() => handleHangup({ongoingCall: ongoingCall ? ongoingCall : undefined, isEmitHangUp: true, isMissed: false})}>
//                     <MdCallEnd size={24}/>
//                 </button>
//                 { !isVoiceCall && 
//                     <button onClick={toggleCamera}>
//                     {!isVidOn  ? <MdVideocam size={28}/> : <MdVideocamOff size={28}/>}
//                     </button>
//                 }

//             </div>
//           </div>
//         </Rnd>
//       );
// }

// export default VideoContainer
