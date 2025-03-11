import React from 'react';
import Header from '@/components/reusables/Header';
import Footer from '@/components/reusables/Footer';
import ProSidebar from '@/components/user/ProSidebar';
import PaymentCard from '@/components/user/PaymentCard';

const PaymentPage: React.FC = () => {

    return (
        <div className="flex flex-col min-h-screen select-none caret-transparent">
            <Header htmlFor='user' />
               <div className='flex flex-row'>
                    <ProSidebar/>
                      <div className="min-h-screen w-lvw flex items-start  justify-center p-4"> 
                        < PaymentCard/>
                       </div>
                 </div>
           <Footer htmlFor='user'/>
        </div>
      );
}

export default PaymentPage