"use client";
import React, { useState } from "react";
import Link from "next/link";
import { UserCog } from "lucide-react";
import DropDown from "@/components/user/DropDown";
import ThemeToggle from "@/components/theme/Toggle";
import LanguageChange from "../LanguageChange";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const settings = {
  icon: <UserCog size={20} />,
  text: "",
};

const Header: React.FC = () => {
  const [down, setDown] = useState<boolean>(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );

  const handleDropDown = (state: boolean): void => {
    setDown(state);
  };

  return (
    <header className="bg-customPink dark:bg-darkGray  dark:shadow-gray-800 shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <p className="text-2xl font-extrabold text-white  dark:text-lightGray">
          Closer
        </p>

        {isAuthenticated && (
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/user/home"
              className="text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-500"
            >
              Home
            </Link>
            <Link
              href="/user/blog"
              className="text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-500"
            >
              Blog
            </Link>
            {/* <Link
              href="/user/chat"
              className="text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-500"
            >
              Chat
            </Link> */}
            <Link
              href="/user/event"
              className="text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-500"
            >
              Event
            </Link>
          </nav>
        )}

        <div className="flex gap-4 ml-0">
          {!isAuthenticated && (
            <Link
              href="/user/login"
              className="text-md  text-white font-semibold hover:text-gray-300 dark:text-lightGray dark:hover:text-gray-500"
            >
              Sign in
            </Link>
          )}

          {/* <div className="relative"> */}
          {isAuthenticated && (
            <span
              className="text-white"
              onMouseOver={() => handleDropDown(true)}
            >
              {settings.icon}
            </span>
          )}

          {/* </div> */}
          <div className="relative w-8">
            <ThemeToggle />
          </div>

          <LanguageChange />
        </div>
        {down && <DropDown onMouseLeave={() => handleDropDown(false)} />}
      </div>
    </header>
  );
};

export default Header;
