'use client'

import React, { useEffect, useState } from 'react';
import setLanguageValue from '../actions/set-language-action';

const LanguageChange: React.FC = () => {
  const [language, setLanguage] = useState<string>('en'); // Default to English

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    localStorage.setItem('language', selectedLang);
    setLanguage(selectedLang);
    setLanguageValue(selectedLang);
  };

  return ( 
    <select
      onChange={changeLanguage}
      value={language}
      className="rounded-lg bg-gray-100 dark:bg-gray-100 
                 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-white 
                 text-center text-xs h-7 text-darkGray shadow-md"
    >
      <option value="en" className="bg-gray-200 dark:bg-gray-700">English</option>
      <option value="de">German</option>
      <option value="fr">French</option>
      <option value="ja">Japanese</option>
    </select>
  );
}

export default LanguageChange;
