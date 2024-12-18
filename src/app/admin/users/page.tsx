import React from 'react';
import Header from '@/components/admin/Header';
import Footer from '@/components/admin/Footer';
import SideBar from '@/components/admin/SideBar';
import UserTable from '@/components/admin/UserTable';


const Users: React.FC = () => {
  return (
    <div  className="flex flex-col min-h-screen">
      <Header/>
        <div className='flex flex-row'>
          <SideBar/>
          <UserTable/>
        </div>
      <Footer/>
    </div>
  )
}

export default Users;