import React from 'react';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import SideBar from '@/components/user/SideBar';
import Card from '@/components/user/card/Card';


const Home: React.FC = () => {

    return (
        <div className="flex flex-col min-h-screen">
            <Header/>
               <div className='flex flex-row'>
                    <SideBar/>
                      <div className="min-h-screen w-lvw flex items-center justify-center p-4">
                        <Card/>
                       </div>
                 </div>
           <Footer/>
        </div>
      );
}

export default Home
