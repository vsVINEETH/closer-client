import React from 'react';
import Header from '@/components/reusables/Header';
import Footer from '@/components/reusables/Footer';
import SideBar from '@/components/user/SideBar';
import EventPaymentCard from '@/components/EventPaymentCard';
const BookPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { id } = params;

  return (
    <div className="flex flex-col min-h-screen select-none caret-transparent">
      <Header htmlFor='user'/>
      <div className="flex flex-row">
        <SideBar />
        <div className="flex-1 p-4">
         <EventPaymentCard id={id}/>
        </div>
      </div>
      <Footer htmlFor='user'/>
    </div>
  );
};

export default BookPage;
