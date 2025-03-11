import React from 'react';
import Header from '@/components/reusables/Header';
import Footer from '@/components/reusables/Footer';
import SideBar from '@/components/user/SideBar';
import BookingDetailsTable from '@/components/user/Bookings';

const Home: React.FC = () => {

    return (
        <div className="flex flex-col min-h-screen select-none caret-transparent">
            <Header htmlFor='user'/>
               <div className='flex flex-row'>
                    <SideBar/>
                      <div className="min-h-screen w-lvw flex  justify-center p-4">
                        <BookingDetailsTable/>
                       </div>
                 </div>
           <Footer htmlFor='user'/>
        </div>
      );
}

export default Home
