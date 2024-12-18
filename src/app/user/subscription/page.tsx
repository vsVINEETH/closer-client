import React from 'react';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import UserProfile from '@/components/user/Profile';
import ProSidebar from '@/components/user/ProSidebar';
import Subscription from '@/components/user/Subscription';

const SubscriptionPage: React.FC = () => {

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
               <div className='flex flex-row'>
                
               
                    <ProSidebar/>
                      <div className="min-h-screen w-lvw flex items-start  justify-center p-4"> 
                        <Subscription/>
                       </div>
                 </div>
           <Footer/>
        </div>
      );
}

export default SubscriptionPage