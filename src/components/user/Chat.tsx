'use client';
import React, { useState, useEffect } from 'react';
import { Mic, SendHorizonal } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import useAxios from '@/hooks/useAxios/useAxios';

const Chat: React.FC = () => {
  const searchParams = useSearchParams();
  const oppositeUserId = searchParams.get('id');
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
  const [input, setInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedText, setRecordedText] = useState<string>('');
  const { socket } = useSocket();
  const [oppoUser, setOppoUser] = useState();
  const {handleRequest} = useAxios()

  const user = useSelector((state: RootState) => state.user.userInfo);

  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (message: { sender: string; content: string }) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, user]);

  useEffect(() => {
    if (recordedText) {
      setInput(recordedText);
    }
  }, [recordedText]);


  const handleSend = () => {
    if (input.trim() && socket && user) {
      const message = {
        sender: user.id, 
        receiver: oppositeUserId, 
        content: input,
        type: 'text'
      };

      socket.emit('sendMessage', message);

      setMessages((prevMessages) => [...prevMessages, { sender: 'You', content: input }]);
      setInput(''); 
    }
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
     
      setTimeout(() => {
        setRecordedText('This is a simulated voice input.');
        setIsRecording(false);
      }, 1000); 
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className="w-full bg-gray-100 overflow-hidden rounded-lg shadow-md p-4">
      <div className="h-96 overflow-y-auto bg-white rounded-lg p-4 mb-4 flex flex-col space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${msg.sender === user?.id ? 'bg-blue-200 self-end' : 'bg-gray-200 self-start'}`}
            style={{
              maxWidth: '70%', // Ensure that the message width is not too large
            }}
          >
            <strong>{msg.sender === user?.id ? 'You' : msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-lg"
        />

        <SendHorizonal size={25} onClick={handleSend} />

        <Mic size={25} onClick={handleVoiceRecording} />
      </div>
    </div>
  );
};

export default Chat;
