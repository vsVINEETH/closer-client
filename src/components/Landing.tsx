'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Users, MessageCircle, Star } from 'lucide-react';
import { couple } from '@/urls/url';

const Landing = () => {
  const t = useTranslations('LandingComponents');


  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  const features = [
    { icon: <Users size={24} />, text:  t('cardOne') },
    { icon: <MessageCircle size={24} />, text: t('cardTwo') },
    { icon: <Star size={24} />, text: t('cardThree') }
  ];

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-900 dark:to-purple-950 min-h-screen p-6">
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left side: Main content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-left max-w-xl p-8 bg-white dark:bg-gray-800 shadow-xl rounded-3xl"
        >
          <motion.div 
            className="mb-6 inline-block"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          >
            <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-2xl">
              <Heart className="w-14 h-14 text-customPink dark:text-pink-400" />
            </div>
          </motion.div>

          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            {t('titleOne')} <span className="text-customPink dark:text-pink-400"> {t('titleTwo')}</span> {t('titleThree')}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
          {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/user/signup"
                className="flex items-center justify-center gap-2 bg-customPink text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:bg-red-500 transition-all w-full"
              >
              {t('getStarted')} <ArrowRight size={18} />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/user/login"
                className="flex items-center justify-center border-2 border-customPink text-customPink dark:text-pink-400 px-8 py-4 text-lg font-bold rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-all w-full"
              >
               
                {t('signIn')}
              </Link>
            </motion.div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg"
              >
                <div className="text-customPink dark:text-pink-400">
                  {feature.icon}
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Right side: Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:block w-full max-w-md"
        >
          <div className="relative">
            <div className="absolute -z-10 w-72 h-72 bg-pink-300 dark:bg-pink-800 rounded-full filter blur-3xl opacity-30 -top-10 -right-10"></div>
            <div className="absolute -z-10 w-72 h-72 bg-purple-300 dark:bg-purple-800 rounded-full filter blur-3xl opacity-30 -bottom-10 -left-10"></div>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden p-6">
              <div className="rounded-2xl bg-gray-200 dark:bg-gray-700 w-full h-96 flex items-center justify-center mb-6">
                {/* Placeholder for image/illustration - in a real app you would use next/image here */}
                {/* <p className="text-gray-500 dark:text-gray-400 text-center p-4">
                  [Couple Profile Illustration]
                </p> */}
                <img src={couple} alt="couple_image" className='w-full h-96 rounded-xl' />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-900 dark:text-white font-bold text-lg">{t('match')} </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm"> {t('comment')}</p>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-customPink text-white p-3 rounded-full"
                >
                  <Heart size={24} />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;