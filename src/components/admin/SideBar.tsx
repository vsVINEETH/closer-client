'use client'
import React from 'react'
import Link from 'next/link'
import { errorToast,infoToast } from '@/utils/toasts/toast';
import { logoutConfirm } from '@/utils/sweet_alert/sweetAlert';
import { useAuth } from '@/hooks/authHooks/useAdminAuth';
import { usePathname } from 'next/navigation'

interface SideBarList {
    href: string,
    text: string
}
const sideBarList: SideBarList[] = [
    {href:"/admin/dashboard", text:'Dashboard'},
    {href:"/admin/advertisement", text:'Advertisement'},
    {href:"/admin/subscription", text:'Subscription'},
    {href:"/admin/employees", text:'Employees'},
    {href:"/admin/users", text:'Users'},
    {href:"/admin/events", text:'Events'},
//    {href:"#", text:'Reports'},
  ]
  

const SideBar: React.FC = () => {
    const {handleLogout} = useAuth();
      const pathname = usePathname();

    const proceedLogout = async (): Promise<void> => {
        try {
            const confirm = await logoutConfirm();
            if(!confirm){ return };
            await handleLogout();
            infoToast('Logged out successfully') 
        } catch (error) {
            console.error(error)
            errorToast('Unable to logout')
        }
    }

    return (
        <aside className="left-0 min-h-screen w-64 border-r dark:border-gray-800 flex-shrink-0 border-gray-300 bg-white dark:bg-nightBlack">

            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                {/* <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"></div> */}
                <span className="font-medium text-black dark:text-white">Admin panel</span>
            </div>

            <nav className="py-4 flex flex-col justify-evenly">
            {sideBarList.map((item, index) => {
                const isActive = pathname === item.href
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`block px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:hover:text-gray-500 dark:text-lightGray
                            ${isActive ? 'bg-customPink text-white dark:bg-darkGray dark:text-white' : ''}`}
                        >
                            {item.text}
                        </Link>
                    )
                })}
               <p className='block font-medium px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:hover:text-gray-800 dark:text-lightGray'
                onClick={ proceedLogout}
                >
                 Logout
                </p>
            </nav>
        </aside>
    )
}

export default SideBar;

