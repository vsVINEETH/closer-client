import React from 'react';
import Header from '@/components/reusables/Header';
import Footer from '@/components/reusables/Footer';
import UserProfile from '@/components/user/Profile';
import ProSidebar from '@/components/user/ProSidebar';

const Profile: React.FC = () => {

    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-nightBlack select-none caret-transparent">
            <Header htmlFor='user'/>
            <div className="flex flex-row flex-1">
                    <ProSidebar/>
                    <main className="flex-1 p-4">
                        <UserProfile/>
                    </main>
                 </div>
           <Footer htmlFor='user'/>
        </div>
      );
}

export default Profile
