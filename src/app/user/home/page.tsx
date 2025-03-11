import React from 'react';
import Header from '@/components/reusables/Header';
import Footer from '@/components/reusables/Footer';
import SideBar from '@/components/user/SideBar';
import Card from '@/components/user/card/Card';
const Home: React.FC = () => {

    return (
        <div className="flex flex-col min-h-screen select-none caret-transparent">
            <Header htmlFor='user'/>
            
               <div className='flex flex-row'>
                    <SideBar/>
                      <div className="min-h-screen w-lvw flex items-center justify-center p-4">
                        <Card/>
                       </div>
                 </div>
           <Footer htmlFor='user'/>
        </div>
      );
}

export default Home
