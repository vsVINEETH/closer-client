import React from 'react';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import SideBar from '@/components/user/SideBar';
import Profile from '@/components/user/Profile';
import UserProfile from '@/components/user/Profile';
import ProSidebar from '@/components/user/ProSidebar';
import { useTranslations } from 'next-intl';

const Home: React.FC = () => {

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
               <div className='flex flex-row'>
               
                    <ProSidebar/>
                      <div className="min-h-screen w-lvw flex items-start mt-20 justify-center p-4">
                        <UserProfile/>
                       </div>
                 </div>
           <Footer/>
        </div>
      );
}

export default Home
