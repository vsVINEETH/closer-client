import React from 'react'
import Header from '@/components/reusables/Header'
import Footer from '@/components/reusables/Footer'
import SideBar from '@/components/employee/SideBar'
import Dashboard from '@/components/employee/Dashboard'
const DashBoard: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen select-none caret-transparent dark:bg-nightBlack ">
      {/* Header */}
      <Header htmlFor='employee' />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="left-0 min-h-screen w-64 border-r dark:border-gray-800 flex-shrink-0 border-gray-300 bg-white dark:bg-nightBlack">
          <SideBar />
        </aside>

        {/* Dashboard */}
        <div className="flex-1 p-6 bg-gray-50 min-h-screen dark:bg-nightBlack">
          <Dashboard />
        </div>
      </div>

      {/* Footer */}
      <Footer htmlFor='employee'/>
    </div>
  );
};

export default DashBoard