import React from "react";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useTranslations } from "next-intl";
interface FooterProps {
  htmlFor: string;
}

const Footer: React.FC <FooterProps> = ({htmlFor}) => {
  const t = useTranslations('Footer');
  return (
    <footer className="bg-customPink text-white dark:text-lightGray dark:bg-darkGray py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Brand Section */}
        <div>
          <h2 className="text-3xl font-extrabold mb-3"> {t('title')}</h2>
          <p className="text-sm text-gray-200 dark:text-gray-400">
          {t('writing')}
          </p>
        </div>

        {/* Quick Links Section */}
        {htmlFor === 'user' &&
          <div>
          <h3 className="text-xl font-semibold mb-4"> {t('quickLinks')}</h3>
          <ul className="space-y-2 text-gray-200 dark:text-gray-400">
            <li><Link href="#" className="hover:text-gray-50 transition"> {t('homeLink')}</Link></li>
            <li><Link href="#" className="hover:text-gray-50 transition">{t('aboutLink')}</Link></li>
            <li><Link href="#" className="hover:text-gray-50 transition">{t('servicesLink')}</Link></li>
            <li><Link href="#" className="hover:text-gray-50 transition">{t('contactLink')}</Link></li>
          </ul>
        </div>}

        {/* Social Media Section */}
    { htmlFor === 'user'  &&
      <div>
            <h3 className="text-xl font-semibold mb-4"> {t('followUs')}</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link href="#" className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition">
                <FaFacebookF className="w-5 h-5" />
              </Link>
              <Link href="#" className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition">
                <FaTwitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition">
                <FaInstagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition">
                <FaLinkedinIn className="w-5 h-5" />
              </Link>
            </div>
          </div>
        }
    </div> 
   

      {/* Copyright Section */}
      <div className="border-t border-white/20 mt-8 pt-4 text-center text-gray-200 dark:text-gray-400 text-sm">
        &copy; {t('rights')}
      </div>
    </footer>
  );
};

export default Footer;
