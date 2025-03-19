'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, SendHorizonal, Trash, Video, Phone, Check, CheckCheck } from 'lucide-react'; 
import { useSearchParams, usePathname } from 'next/navigation';
import { useSocket, SocketUser } from '@/context/SocketContext2';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import VoiceMessage from './Voice';
import CallTypes from './CallType';
import { infoToast } from '@/utils/toasts/toast';
import { useFetch } from '@/hooks/fetchHooks/useUserFetch';
import FloatingEmojiPicker from './EmojiPicker';

interface Receiver {
  _id: string,
  username: string,
  image: string,
}

interface Chats {
  _id?: string,
  sender: string,
  senderProfile?: {
    _id: string,
    username: string,
    image: string[] | undefined,
  }
  receiver: {
    _id: string,
    username: string,
    image: string,
  },
  message: string,
  type: string,
  callType?: string,
  callDuration?: number,
  status:string,
  isMissed?: boolean,
  isRead?: boolean,
  createdAt?: string ,
}

const Chat: React.FC = () => {
  const searchParams = useSearchParams();
  const oppositeUserId = searchParams.get('id');
  const pathname = usePathname();

  const [messages, setMessages] = useState<Chats[]>([]);
  const [input, setInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [oppoUser, setOppoUser] = useState<Receiver>();
  const [recordingTime, setRecordingTime] = useState<number>(0); // Track recording time
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // Store interval for recording time

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { socket, handleCall, onlineUsers, isCallEnded, setVoiceCall, ongoingCall, receivedMessage,  checkOnlineStatus, handleStatus, oppositeUserIsOnline, callLogHandler } = useSocket();

  const user = useSelector((state: RootState) => state.user.userInfo);
  const {getChats, sendAudio} = useFetch()

  const oppositeUser:SocketUser[] | undefined = onlineUsers?.filter(onlineUser => {
    return onlineUser.userId === oppositeUserId ? onlineUser : null;
  });

  useEffect(() => {
    handleReadMessage()
    fetchChat();
    handleStatus(oppositeUserId);
  }, [oppositeUserId]);

  const handleReadMessage = useCallback(() => {
    socket?.emit("readMessage", {
      sender: oppositeUserId,
      receiver: user?.id,
    });
  },[oppositeUserId]);

  useEffect(() => {
    if (!receivedMessage) return; // Exit early if no message
  
    const currentUrl = searchParams.toString()
      ? `${pathname}/?${searchParams.toString()}`
      : pathname;
    const expectedUrl = `/user/chat/?id=${String(receivedMessage.sender)}`;
  
    if (currentUrl === expectedUrl && receivedMessage.message) {
        socket?.emit("readMessage", {
          sender: receivedMessage.sender,
          receiver: receivedMessage.receiver._id,
          chatId: receivedMessage._id,
        });

      setMessages((prevMessages) =>{
        const updatedMessages = prevMessages.map((msg) =>
          msg.sender === receivedMessage.sender && !msg.isRead
            ? { ...msg, status: 'read', isRead: true }
            : msg
          );
            return updatedMessages
      });
    }
  
    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.map((msg) =>
        msg._id === receivedMessage._id ? receivedMessage : msg
      );
    
      const messageExists = prevMessages.some((msg) => msg._id === receivedMessage._id);
      return messageExists ? updatedMessages : [...updatedMessages, receivedMessage];
    });
    
  }, [receivedMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  useEffect(() => {
    if (socket && oppositeUserId) {
      checkOnlineStatus(oppositeUserId);
    }
  }, [socket, oppositeUserId]);



  const handleCallWithOppositeUser = (callType:string) => {
    if(isCallEnded && ongoingCall){return};
    if(callType === 'video' && !user?.prime?.isPrime){
      infoToast('This is an Prime feature');
      return;
    }
    if (oppositeUser && oppositeUser.length > 0 && callType === 'video') {
      setVoiceCall(false);
      handleCall(oppositeUser[0], false);
    }else if (oppositeUser && oppositeUser.length > 0 && callType === 'audio') {
      setVoiceCall(true);
      handleCall(oppositeUser[0], true);
    } 
    else {
      infoToast('user is unavailable')
      if(user?.id && oppositeUserId){
        callLogHandler(ongoingCall,{caller: user?.id, receiver: oppositeUserId, callType: callType, isMissed: true});
      }
      return;
    }
  };

  async function fetchChat ()  {
    if (!user || !oppositeUserId) return;

    const response = await getChats(user.id, oppositeUserId)
    if (response.data) {
      setMessages(response.data.chats || []);
      const receiverData = response.data?.receiver || response.data;

      setOppoUser({
        _id: receiverData._id,
        username: receiverData.username || 'Unknown',
        image: receiverData.image[0],
      });
    }
  };

  const handleSend = async () => {
    try {

      if (!socket || !user) return;

      let messageContent = input.trim();
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, `audio-${Date.now()}.mp3`);

        const uploadResponse = await sendAudio(formData);
        if (
          uploadResponse?.data?.files &&
          uploadResponse.data.files.length > 0 &&
          uploadResponse.data.files[0].location
        ) {
          messageContent = uploadResponse.data.files[0].location; 
        } else {
          console.error('Failed to upload audio or file location missing');
          return;
        }
      }

      if (!messageContent) return;

      const message: Chats = {
        sender: user.id,
        senderProfile:{
          _id: user.id,
          username: user.username,
          image: user?.image,
        },
        receiver: {
          _id: oppositeUserId || '',
          username: oppoUser?.username || 'Unknown',
          image: '',
        },
        message: messageContent,
        type: audioBlob ? 'audio' : 'text',
        isRead: false,
        status:'sent',
        createdAt: new Date().toISOString(),
      };

      socket.emit('sendMessage', message);
      // socket.on('')
    //  setMessages((prevMessages) => [...prevMessages, message]);
      setInput('');
      setAudioBlob(null); 
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        setAudioBlob( e.data);
  
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      const intervalId = setInterval(() => setRecordingTime((prevTime) => prevTime + 1), 1000);
      setIntervalId(intervalId);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const handleDeleteRecording = () => {
    handleStopRecording()
    setAudioBlob(null);
    setRecordingTime(0);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return (
    <div className="w-full bg-gray-100 dark:bg-darkGray dark:border-gray-700 overflow-hidden rounded-lg shadow-md p-4">
        {/* { callVideo && oppositeUserId && 
          <VideoC recipientId={oppositeUserId} setCallVideoActive={setCallVideo} />
        } */}
       
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={oppoUser?.image}
          alt={oppoUser?.username || 'User'}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="text-lg text-black dark:text-lightGray font-semibold">{oppoUser?.username || 'Unknown User'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{ oppositeUserIsOnline ? 'Online' : 'Offline'}</p>
        </div>

          <Video size={25} onClick={() => handleCallWithOppositeUser('video') } className='dark:text-gray-400'/> 
          <Phone size={19} onClick={() => handleCallWithOppositeUser('audio')} className='dark:text-gray-400'/>
      
      </div>
      
      <div
        ref={chatContainerRef}
        className="h-96 overflow-y-auto bg-white dark:bg-nightBlack rounded-lg p-4 mb-4 flex flex-col space-y-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 scrollable-container"
      >  
        {messages.map((msg, idx) => (
         
          <div
          
            key={idx}
            className={`p-2 max-w-72 rounded ${
              msg.sender === user?.id ? 'bg-blue-200 self-end' : 'bg-gray-200  self-start'
            }`}
          >
            {msg.type === 'audio' ? ( <VoiceMessage audioSrc={msg.message}/>) : msg.type === 'text' ? ( <span className="text-sm">{msg.message}</span> ) : msg.type === 'call' ? <CallTypes type={msg.callType} caller={msg.senderProfile?.username} isMissed={msg.isMissed} callerId={msg.sender} callDuration={msg.callDuration} /> :""}

            <span className="text-[9px] font-thin align-bottom">
              &nbsp; {new Date(msg.createdAt ?? new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
             {msg.type !== 'call'  &&
              msg.status === 'sent' && msg.sender === user?.id? <Check size={10}/> :  msg.status === 'delivered' && msg.sender === user?.id ? <CheckCheck size={10}/> : msg.status === 'read' && msg.sender === user?.id ?<CheckCheck size={10} className='text-blue-600'/> : '' }
          </div>
        ))}

      </div>
      
      <div className="flex items-center space-x-5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' ? handleSend() : null}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-lg dark:border-gray-700 dark:text-white dark:bg-nightBlack"
        />

        {!isRecording &&
          <SendHorizonal size={25} onClick={() => handleSend() }  className='dark:text-lightBlue'/>
        }

        <FloatingEmojiPicker
          onEmojiSelect={(emoji) => setInput((prev) => prev + emoji)}
        />

        {isRecording ? (
            <div className=" flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-lightGray">{recordingTime}s</span>
              <Trash
                size={18}
                className="cursor-pointer text-red-600"
                onClick={handleDeleteRecording}
              />
            </div>
          ) : audioBlob ? (
            <div className=" flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-lightGray">{recordingTime}s</span>
              <Trash
                size={18}
                className="cursor-pointer text-red-600"
                onClick={handleDeleteRecording}
              />
            </div>
          ) : null}
        <div className="relative">

          <Mic
            size={25}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`transition-all duration-300 ${isRecording ? 'text-blue-600 animate-mic-pulse' : 'text-black dark:text-white'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
