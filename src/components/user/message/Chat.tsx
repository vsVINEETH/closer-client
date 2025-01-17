'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Mic, SendHorizonal, Trash, Video, Phone } from 'lucide-react'; 
import { useSearchParams } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import useAxios from '@/hooks/useAxios/useAxios';
import VideoCall from './VideoCall';
import VoiceMessage from './Voice';

interface Receiver {
  _id: string,
  username: string,
  image: string,
}

interface Chats {
  _id?: string,
  sender: string,
  receiver: {
    _id: string,
    username: string,
    image: string,
  },
  message: string,
  type: string,
  isRead: boolean,
  createdAt: string,
}

const Chat: React.FC = () => {
  const searchParams = useSearchParams();
  const oppositeUserId = searchParams.get('id');

  const [messages, setMessages] = useState<Chats[]>([]);
  const [input, setInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false); 
  const [oppoUser, setOppoUser] = useState<Receiver>();
  const [recordingTime, setRecordingTime] = useState<number>(0); // Track recording time
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // Store interval for recording time
  const [callVideo, setCallVideo] = useState<boolean>(false);
  const [callVoice, setCallVoice] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const { handleRequest } = useAxios();
  const user = useSelector((state: RootState) => state.user.userInfo);

  useEffect(() => {
    fetchChat();
  }, []);

  useEffect(() => {
    if (socket && oppositeUserId) {
      socket.emit('checkOnlineStatus', oppositeUserId);
    }
  }, [socket]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !user || !oppositeUserId) return;

    const handleReceiveMessage = (message: Chats) => {
      console.log(message)
      //setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleOnlineStatus = (status: { userId: string; isOnline: boolean }) => {
      if (status.userId === oppositeUserId) {
        setIsOnline(status.isOnline);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('onlineStatus', handleOnlineStatus);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('onlineStatus', handleOnlineStatus);
    };
  }, [socket, user, oppositeUserId]);

  const fetchChat = async () => {
    if (!user || !oppositeUserId) return;

    const response = await handleRequest({
      url: '/api/user/chats',
      method: 'GET',
      params: {
        sender: user.id,
        receiver: oppositeUserId,
      },
    });

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
        const uploadResponse = await handleRequest({
          url: '/api/user/upload_audio',
          method: 'POST',
          data: formData,
        });

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
        receiver: {
          _id: oppositeUserId || '',
          username: oppoUser?.username || 'Unknown',
          image: '',
        },
        message: messageContent,
        type: audioBlob ? 'audio' : 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      socket.emit('sendMessage', message);
      console.log(message)
      setMessages((prevMessages) => [...prevMessages, message]);
      setInput('');
      setAudioBlob(null); 
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // const groupMessagesByDate = (messages: Chats[]) => {
  //   return messages.reduce((acc, message) => {
  //     const date = new Date(message.createdAt);
  
  //     // Format the date as DD/MM/YYYY
  //     const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  
  //     if (!acc[formattedDate]) {
  //       acc[formattedDate] = [];
  //     }
  //     acc[formattedDate].push(message);
  //     return acc;
  //   }, {} as Record<string, Chats[]>);
  // };
  
  // // Grouped messages
  // const groupedMessages = groupMessagesByDate(messages);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        setAudioBlob(e.data);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      const id = setInterval(() => setRecordingTime((prevTime) => prevTime + 1), 1000);
      setIntervalId(id);
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
    <div className="w-full bg-gray-100 overflow-hidden rounded-lg shadow-md p-4">
        {callVideo && socket && oppositeUserId &&//this 
          <VideoCall recipientId={oppositeUserId} setCallVideoActive={setCallVideo}/>
        }
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={oppoUser?.image}
          alt={oppoUser?.username || 'User'}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="text-lg font-semibold">{oppoUser?.username || 'Unknown User'}</p>
          <p className="text-sm text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
        
          <Video size={25} onClick={() => setCallVideo(prev => !prev)}/>
          <Phone size={19}/>

      </div>

      <div
        ref={chatContainerRef}
        className="h-96 overflow-y-auto bg-white rounded-lg p-4 mb-4 flex flex-col space-y-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200"
      >
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 max-w-72 rounded ${
              msg.sender === user?.id ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'
            }`}
          >
            {msg.type === 'audio' ? (
              // <div className="flex justify-center items-center mt-2">
              //   <audio
              //     controls
              //     controlsList="nodownload noremoteplayback mute"
              //     src={msg.message}
              //     className="w-full max-w-[180px] rounded-lg bg-gray-100 shadow-lg"
              //   ></audio>
              //   </div>
                <VoiceMessage audioSrc={msg.message}/>
              
            ) : (
              <span className="text-sm">{msg.message}</span>
            )}

            <span className="text-[9px] font-thin align-bottom">
              &nbsp; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

       {/* {Object.keys(groupedMessages).map((date) => (
          <div key={date} >
      
            <div className="text-center text-sm font-semibold text-gray-500 my-2">
              {date}
            </div>
           
            {groupedMessages[date].map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 max-w-72 rounded ${
                  msg.sender === user?.id ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'
                }`}
              >
                {msg.type === 'audio' ? (
                  <VoiceMessage audioSrc={msg.message} />
                ) : (
                  <span className="text-sm">{msg.message}</span>
                )}
                <span className="text-[9px] font-thin align-bottom">
                  &nbsp; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ))} */}
         
      </div>

      <div className="flex items-center space-x-5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {e.key === 'Enter'? handleSend() : 0}}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-lg"
        />
        {!isRecording &&
        <SendHorizonal size={25} onClick={() => handleSend() } />
         }
        {isRecording ? (
            <div className=" flex items-center space-x-2">
              <span className="text-xs text-gray-600">{recordingTime}s</span>
              <Trash
                size={18}
                className="cursor-pointer text-red-600"
                onClick={handleDeleteRecording}
              />
            </div>
          ) : audioBlob ? (
            <div className=" flex items-center space-x-2">
              <span className="text-xs text-gray-600">{recordingTime}s</span>
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
            className={`transition-all duration-300 ${isRecording ? 'text-blue-600 animate-mic-pulse' : 'text-black'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
