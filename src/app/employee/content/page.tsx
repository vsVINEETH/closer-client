import React from "react";
import Header from "@/components/reusables/Header";
import Footer from "@/components/reusables/Footer";
import SideBar from '@/components/employee/SideBar'
import ContentTable from "@/components/employee/ContentTable";

const Content: React.FC = () => {

    return(
        <div  className="flex flex-col min-h-screen select-none caret-transparent">
        <Header htmlFor="employee"/>
          <div className='flex flex-row'>
            <SideBar/>
            <div className="min-h-screen w-lvw flex items-center justify-center p-4">
             <ContentTable/>
           </div>
          </div>
        <Footer htmlFor="employee"/>
      </div>
    )
}

export default Content;