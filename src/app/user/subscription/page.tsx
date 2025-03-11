import React from 'react';
import Header from '@/components/reusables/Header';
import Footer from '@/components/reusables/Footer';
import ProSidebar from '@/components/user/ProSidebar';
import Subscription from '@/components/user/Subscription';

const SubscriptionPage: React.FC = () => {

    return (
        <div className="flex flex-col min-h-screen select-none caret-transparent">
            <Header htmlFor='user'/>
               <div className='flex flex-row'>
                    <ProSidebar/>
                      <div className="min-h-screen w-lvw   items-start  justify-center p-2"> 
                        <Subscription/>
                     </div>
                 </div>
           <Footer htmlFor='user'/>
        </div>
      );
}

export default SubscriptionPage