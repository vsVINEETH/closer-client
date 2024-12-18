import React from "react";
import Header from '@/components/employee/Header'
import Footer from '@/components/employee/Footer'
import SideBar from '@/components/employee/SideBar'
import PasswordForm from "@/components/employee/PasswordForm";

const Security: React.FC = () => {

    return(
        <div  className="flex flex-col min-h-screen">
        <Header/>
          <div className='flex flex-row'>
            <SideBar/>
             <div className="min-h-screen w-lvw flex items-center justify-center p-4">
              <PasswordForm/>
             </div>
          </div>
        <Footer/>
      </div>
    )
}

export default Security; 