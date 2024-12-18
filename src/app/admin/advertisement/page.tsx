import React from 'react'
import Header from '@/components/admin/Header'
import Footer from '@/components/admin/Footer'
import SideBar from '@/components/admin/SideBar'
import AdvertisementTable from '@/components/admin/Advertisement'
const Advertisement: React.FC = () => {
  return (
    <div  className="flex flex-col min-h-screen">
      <Header/>
        <div className='flex flex-row'>
          <SideBar/>
          <div className="min-h-screen w-lvw flex items-center justify-center p-4">
           <AdvertisementTable />
          </div>
        </div>
      <Footer/>
    </div>
  )
}

export default Advertisement