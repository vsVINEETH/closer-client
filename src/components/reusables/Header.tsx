"use client";
import React, { useState } from "react";
import Link from "next/link";
import { UserCog } from "lucide-react";
import DropDown from "@/components/user/DropDown";
import ThemeToggle from "@/components/theme/Toggle";
import LanguageChange from "../LanguageChange";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useTranslations } from "next-intl";

interface HeaderProps {
  htmlFor: string; // Renamed from `for` to `htmlFor`
};

const Header: React.FC<HeaderProps> = ({ htmlFor }) => {
  const t = useTranslations("Header");
  const [setting, setSetting] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );


  return (
    <header className="bg-customPink dark:bg-darkGray dark:shadow-gray-800 shadow-md p-4">
    
    <div className="container mx-auto flex justify-between items-center">
      <p className="text-2xl font-extrabold text-white dark:text-lightGray">
        {t('title')}
      </p>

      
      {/* Desktop Navigation (Hidden on small screens) */}
      {isAuthenticated && htmlFor === 'user' && (
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/user/home"
            className="text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-500"
          >
            
            {t('home')}
          </Link>
          <Link
            href="/user/blog"
            className="text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-500"
          >
          
            {t('blog')}
          </Link>
          <Link
            href="/user/events"
            className="text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-500"
          >
            {t('event')}
          </Link>
        </nav>
      )}

      {/* Mobile Menu Button */}
     {isAuthenticated && htmlFor === 'user' &&
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-white text-2xl focus:outline-none"
      >
        ☰
      </button>}

      {/* Mobile Dropdown */}
      {menuOpen && htmlFor === 'user' && (
        <div className="absolute top-16 right-4 bg-white dark:bg-darkGray shadow-lg rounded-lg p-4 flex flex-col space-y-3 md:hidden z-50">
          <Link
            href="/user/home"
            className="text-black dark:text-lightGray font-semibold hover:text-gray-600 dark:hover:text-gray-400"
            onClick={() => setMenuOpen(false)}
          >
          
            {t('home')}
          </Link>
          <Link
            href="/user/blog"
            className="text-black dark:text-lightGray font-semibold hover:text-gray-600 dark:hover:text-gray-400"
            onClick={() => setMenuOpen(false)}
          >
           
            {t('blog')}
          </Link>
          <Link
            href="/user/events"
            className="text-black dark:text-lightGray font-semibold hover:text-gray-600 dark:hover:text-gray-400"
            onClick={() => setMenuOpen(false)}
          >
          
            {t('event')}
          </Link>
        </div>
      )}

      {/* Right Side Icons */}
      <div className="flex gap-4 ml-0">
        {!isAuthenticated && htmlFor === 'user' && (
          <Link
            href="/user/login"
            className="text-md text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-500"
          >
            
            {t('signIn')}
          </Link>
        )}
        {isAuthenticated && (
          <span
            className="text-white cursor-pointer "
            onClick={setting ? () => setSetting(false) : () => setSetting(true)}

          >
             <UserCog size={26} />
          </span>
        )}

        <div className="relative w-8">
          <ThemeToggle />
        </div>
    { htmlFor === 'user' &&     
        <LanguageChange />}
      </div>

      {/* User Dropdown */}
      {setting && htmlFor === 'user' && <DropDown  />}
        
    </div>
  </header>
  );
};

export default Header;


// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { UserCog, Menu, X } from "lucide-react";
// import DropDown from "@/components/user/DropDown";
// import ThemeToggle from "@/components/theme/Toggle";
// import LanguageChange from "../LanguageChange";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";

// const settings = {
//   icon: <UserCog size={24} />,
// };

// const Header: React.FC = () => {
//   const [down, setDown] = useState<boolean>(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const isAuthenticated = useSelector(
//     (state: RootState) => state.user.isAuthenticated
//   );

//   const handleDropDown = (state: boolean): void => {
//     setDown(state);
//   };

//   return (
//     <header className="bg-gradient-to-r from-pink-500 to-red-500 dark:from-gray-900 dark:to-gray-800 shadow-lg p-4">
//       <div className="container mx-auto flex justify-between items-center">
        
//         {/* Logo */}
//         <motion.p 
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-3xl font-extrabold text-white dark:text-lightGray tracking-wider"
//         >
//           Closer ❤️
//         </motion.p>

//         {/* Desktop Navigation */}
//         {isAuthenticated && (
//           <nav className="hidden md:flex space-x-6">
//             {["Home", "Blog", "Events"].map((item, index) => (
//               <motion.div
//                 key={item}
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//               >
//                 <Link
//                   href={`/user/${item.toLowerCase()}`}
//                   className="text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-400 transition-all"
//                 >
//                   {item}
//                 </Link>
//               </motion.div>
//             ))}
//           </nav>
//         )}

//         {/* Mobile Menu Toggle */}
//         <motion.button
//           onClick={() => setMenuOpen(!menuOpen)}
//           className="md:hidden text-white text-3xl focus:outline-none"
//           whileTap={{ scale: 0.9 }}
//         >
//           {menuOpen ? <X size={28} /> : <Menu size={28} />}
//         </motion.button>

//         {/* Mobile Dropdown Menu */}
//         {menuOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="absolute top-16 right-4 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 flex flex-col space-y-3 md:hidden z-50 backdrop-blur-md"
//           >
//             {["Home", "Blog", "Events"].map((item) => (
//               <Link
//                 key={item}
//                 href={`/user/${item.toLowerCase()}`}
//                 className="text-gray-900 dark:text-lightGray font-semibold hover:text-pink-500 dark:hover:text-pink-400 transition-all"
//                 onClick={() => setMenuOpen(false)}
//               >
//                 {item}
//               </Link>
//             ))}
//           </motion.div>
//         )}

//         {/* Right Side Icons */}
//         <div className="flex gap-4">
//           {!isAuthenticated && (
//             <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
//               <Link
//                 href="/user/login"
//                 className="text-lg text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-400 transition-all"
//               >
//                 Sign in
//               </Link>
//             </motion.div>
//           )}
//           {isAuthenticated && (
//             <motion.span
//               className="text-white cursor-pointer"
//               onMouseOver={() => handleDropDown(true)}
//               whileHover={{ scale: 1.2 }}
//             >
//               {settings.icon}
//             </motion.span>
//           )}
//           <div className="relative w-8">
//             <ThemeToggle />
//           </div>
//           <LanguageChange />
//         </div>

//         {/* User Dropdown */}
//         {down && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="absolute top-16 right-6 z-50"
//           >
//             <DropDown onMouseLeave={() => handleDropDown(false)} />
//           </motion.div>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;
