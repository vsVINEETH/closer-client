'use client'

import React from 'react';
import setLanguageValue from '../actions/set-language-action'

const LanguageChange: React.FC = () => {
  return (
    <>
    <select onChange={(e) => setLanguageValue(e.target.value)}
    className='rounded-lg bg-gray-100 dark:bg-gray-100 
     hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-white text-center text-xs h-7 text-darkGray shadow-md'
        >
        <option value="en"  className="bg-gray-200 dark:bg-gray-700">English</option>
        <option value="de">German</option>
    </select>
    </>
  )
}

export default LanguageChange;
