import type React from "react"
import { PhoneMissed, Video, Phone } from "lucide-react"
import { MdMissedVideoCall, MdPhoneCallback,  MdOutlineMissedVideoCall  } from "react-icons/md";

import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface CallTypeProps {
  type?: string,
  caller?: string
  callerId?: string,
  time?: string,
  isMissed?: boolean,
  callDuration?: number,
}

const CallTypes: React.FC<CallTypeProps> = ({ type, caller, isMissed ,time, callerId, callDuration }) => {
    let currType: string | undefined;
    const userId = useSelector((state: RootState) => state.user.userInfo?.id);
   
  const getIcon = () => {
      if(callerId == userId && type === 'audio' && isMissed ){
        currType = 'noAudioAnswer'
      }else if (callerId == userId && type === 'video' && isMissed ){
        currType = 'noVideoAnswer'
      }else if(type === 'audio' && isMissed){
        currType = 'missedAudio'
       }else if(type === 'video' && isMissed){
        currType = 'missedVideo'
       }else{
         currType = type;
       }
      
    switch (currType) {
      case "missedAudio":
        return <PhoneMissed className="w-4 h-4 text-red-500" />
      case 'missedVideo':
        return <MdMissedVideoCall className="w-4 h-4 text-red-500" />
      case "video":
        return <Video className="w-4 h-4 text-blue-500" />
      case "audio":
        return <Phone className="w-4 h-4 text-green-500" />
      case 'noAudioAnswer':
        return <MdPhoneCallback className="w-4 h-4 text-gray-600"/>
      case 'noVideoAnswer':
        return <MdOutlineMissedVideoCall className="w-4 h-4 text-gray-600"/>
    default:
        return 
    }
  }

  const getTypeText = () => {
    switch (currType) {
      case "missedAudio":
        return "Missed audio call"
      case 'missedVideo':
        return "Missed video call"
      case "video":
        return "Video call"
      case "audio":
        return 'Audio call'
      case 'noAudioAnswer':
        return 'No answer'
      case 'noVideoAnswer':
        return 'No answer'
     default:
        return
    }
  }

  const formatDuration = (seconds: number | undefined): string => {
    if(!seconds) return '';
    if (seconds < 60) return `${seconds}s`;
  
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min ${seconds % 60}s`;
  
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className="flex items-center p-2 bg-white rounded-lg shadow-sm max-w-xs">
      <div className="mr-3">{getIcon()}</div>
      <div className="flex-grow">
        <p className="text-sm font-medium text-gray-900">{caller}</p>
        <p className="text-xs text-gray-500">{getTypeText()}</p>
        <p className="text-xs text-gray-500">{currType !== 'missedAudio' && currType !== 'missedVideo' && currType !== 'noAudioAnswer' && currType !== 'noVideoAnswer' ? formatDuration(callDuration) : ''}</p>
      </div>
      <div className="text-xs text-gray-400">{time}</div>
    </div>
  )
}

export default  CallTypes