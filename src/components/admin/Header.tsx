import React from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/theme/Toggle'

const Header: React.FC = () => {
  return (
    <header className="bg-customPink dark:bg-darkGray shadow-md dark:shadow-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="#" className="text-2xl font-extrabold text-white dark:text-lightGray">Closer Admin</Link>
            <ThemeToggle/>
        </div>
        
    </header>
  )
}

export default Header;