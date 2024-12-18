'use client'
import Header from "../components/user/Header";
import Footer from '../components/user/Footer'
import Link from 'next/link';
import {useTranslations} from 'next-intl';

export default function Landing() {
  const t = useTranslations('HomePage');
  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold dark:bg-lightGray mb-4">Start something epic {t('title')}</h1>
          <Link href='/user/signup' className="bg-customPink text-white p-1 text-sm font-bold rounded-lg">Sign up</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
