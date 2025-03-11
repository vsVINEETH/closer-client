import React from 'react';
import Header from '@/components/reusables/Header';
import Footer from '@/components/reusables/Footer';
import SideBar from '@/components/user/SideBar';
import Chat from '@/components/user/message/Chat';
const ChatPage: React.FC = () => {
    return (
      <div className="flex flex-col min-h-screen  caret-transparent">
        <Header htmlFor='user'/>
        <div className="flex flex-grow">
          <SideBar />
          <div className="flex-grow flex items-center justify-center p-4">
            <Chat />
          </div>
        </div>
        <Footer htmlFor='user'/>
      </div>
    );
  };
  
  export default ChatPage;
  