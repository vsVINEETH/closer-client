import React from 'react'
import Header from '@/components/admin/Header'
import Footer from '@/components/admin/Footer'
import SideBar from '@/components/admin/SideBar'


const DashBoard: React.FC = () => {
  return (
    <div  className="flex flex-col min-h-screen">
      <Header/>
        <div className='flex flex-row'>
          <SideBar/>
        </div>
      <Footer/>
    </div>
  )
}

export default DashBoard