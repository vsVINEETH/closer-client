'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { store, RootState } from '@/store';
import { logout } from '@/store/slices/employeeSlice';
import useAxios from '@/hooks/useAxios/useAxios';
import { errorToast, infoToast } from '@/utils/toasts/toats';


interface SideBarList {
    href: string,
    text: string
}

const sideBarList: SideBarList[] = [
    {href:"/employee/dashboard", text:'Dashboard'},
    {href:"/employee/content", text:'Content'},
    {href:"/employee/category", text:'Category'},
    {href:"/employee/security", text:'Security'},
  ]
 
const SideBar: React.FC = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const {handleRequest} = useAxios()

  const empAth = useSelector((state: RootState) => state.employee.isAuthenticated);
  const empInfo = useSelector((state: RootState) => state.employee.employeeInfo);

  const handleLogout = async (): Promise<void> => {
    const response = await handleRequest({
      url:'/api/employee/logout',
      method:'DELETE',
    })

    if(response.error){
      errorToast(response.error)
    }
    if(response.data){
      dispatch(logout());
      router.push('/employee/login')
      infoToast(response.data)
    }
    
  }
 
  return (
    <aside className="left-0 min-h-screen w-64 border-r dark:border-gray-800 flex-shrink-0 border-gray-300 bg-white dark:bg-nightBlack">

        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            {/* <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"></div> */}
            <span className="font-medium text-black dark:text-white">Employee panel</span>
        </div>

        <nav className="py-4 flex flex-col justify-evenly">
            {sideBarList.map((item, index) => (
            <Link
            key={index}
            href={item.href}
            className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:hover:text-gray-800 dark:text-lightGray"
            >
                {item.text}
            </Link>
            ))}
            <p className='block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:hover:text-gray-800 dark:text-lightGray'
            onClick={handleLogout}
            >
              Logout
            </p>
        </nav>

    </aside>

  )
}

export default SideBar;
