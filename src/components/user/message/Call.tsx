'use client'
import { useSocket } from "@/context/SocketContext2"
import React, { useEffect, useState} from "react"
import VideoContainer from "./VideoContainer";

const Call: React.FC = () => {
    const { localStream, peer, ongoingCall, handleHangup, isCallEnded, isVoiceCall } = useSocket();
    const [isMicOn, setIsMicOn] = useState<boolean>(true);
    const [isVidOn, setIsVidOn] = useState<boolean>(true);

    useEffect(() => {
        if (localStream) {
            // Handle audio track
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                setIsMicOn(audioTracks[0].enabled);
            } else {
                console.warn('No audio tracks found in localStream');
            }

            // Handle video track (only for video calls)
            if (!isVoiceCall) {
                const videoTracks = localStream.getVideoTracks();
                if (videoTracks.length > 0) {
                    setIsVidOn(videoTracks[0].enabled);
                } else {
                    console.warn('No video tracks found in localStream');
                }
            }
        }
    },[localStream])

    const toggleCamera = () => {
        if(localStream){
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVidOn(videoTrack.enabled);
        }
    };

    const toggleMic = () => {
        if(localStream){
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    };

    const isOnCall = localStream && peer && ongoingCall ? true : false;

    // if(isCallEnded){
    // return <div className="mt-5 text-rose-500 text-center">Call ended</div>
    // }

    if(!localStream && !peer) return;

    return(
        <div className="items-center justify-center">
           {/*  video stream (localStream)       */}
             {localStream && !isCallEnded &&
                <VideoContainer 
                stream={localStream}
                isLocalStream={true}
                isOnCall={isOnCall}
                toggleMic={toggleMic}
                toggleCamera={toggleCamera}
                handleHangup={handleHangup}
                ongoingCall={ongoingCall}
                isMicOn={isMicOn}
                isVidOn={isVidOn}
                isVoiceCall={isVoiceCall}
                peerStream={peer?.stream}
                />
            }
        </div>)
}

export default Call