import React from 'react';
import Header from '@/components/reusables/Header';
import Footer from '@/components/reusables/Footer';
import SideBar from '@/components/user/SideBar';
import Event from '@/components/user/event/Event';
const EventPage: React.FC = () => {

    return (
        <div className="flex flex-col min-h-screen select-none caret-transparent">
            <Header htmlFor='user'/>
               <div className='flex flex-row'>
                    <SideBar/>
                      <div className="min-h-screen w-lvw flex items-center justify-center p-4">
                       <Event/>
                       </div>
                 </div>
           <Footer htmlFor='user'/>
        </div>
      );
}

export default EventPage