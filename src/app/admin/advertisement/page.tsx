import React from 'react'
import Header from '@/components/reusables/Header'
import Footer from '@/components/reusables/Footer'
import SideBar from '@/components/admin/SideBar'
import AdvertisementTable from '@/components/admin/Advertisement'
const Advertisement: React.FC = () => {
  return (
    <div  className="flex flex-col min-h-screen select-none caret-transparent">
      <Header htmlFor='admin'/>
        <div className='flex flex-row'>
          <SideBar/>
          <div className="min-h-screen w-lvw flex items-center justify-center p-4">
           <AdvertisementTable />
          </div>
        </div>
      <Footer htmlFor='admin'/>
    </div>
  )
}

export default Advertisement