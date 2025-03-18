'use client';
import React, { useState, useEffect, useCallback } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { updatePreferences } from "@/store/slices/userSlice";
import { Crown } from "lucide-react";


const ProSidebar: React.FC = () => {
  const userPreference = useSelector((state: RootState) => state.user.userInfo);
  const [ageRange, setAgeRange] = useState<[number, number]>( userPreference?.preferences?.ageRange||[18, 50]);
  const [distance, setDistance] = useState<number>(userPreference?.preferences?.distance ||10);
  const [interestedIn, setInterestedIn] = useState<string>(userPreference?.preferences?.interestedIn || userPreference?.interestedIn || '' );
  const [lookingFor, setLookingFor] = useState<string>(userPreference?.preferences?.lookingFor || userPreference?.lookingFor || '' );

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  const dispatch = useDispatch()

  const prime = useSelector((state: RootState) => state.user.userInfo?.prime);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
      const width = window.innerWidth;
      if (width >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    // Set initial width
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    updateUserPreferences();
  },[ageRange, distance, lookingFor, interestedIn])

  const updateUserPreferences = useCallback(() => {
    dispatch(
      updatePreferences({
        interestedIn: interestedIn,
        ageRange: ageRange,
        distance: distance,
        lookingFor: lookingFor,
      })
    )
  },[ageRange, distance, lookingFor, interestedIn])

  const toggleSidebar = () => {
    const width = window.innerWidth;
    if (width < 1024) {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  return (
    
    <div className="lg:w-96 ">
      {/* Arrow Button for Opening Sidebar */}
      {screenWidth < 1024 && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-16 left-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-nightBlack border border-gray-300 shadow-lg ${
            isSidebarOpen ? "hidden" : ""
          }`}
        >
          <HiArrowRight className="text-base text-gray-700 dark:text-white" />
        </button>
      )}
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed top-16 left-0 z-40 min-h-[calc(100vh-64px)] w-72 transform border-r dark:border-gray-800 flex-shrink-0 border-gray-300 bg-white dark:bg-nightBlack transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:min-h-full lg:w-96`}
      >
       <section className="p-4  dark:bg-nightBlack w-full">          
        {!prime?.isPrime ?
          <Link href='/user/subscription'>
          <div className="text-center mb-4 border dark:bg-darkGray rounded-md p-4 shadow-md">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Closer <span className="text-customPink">Prime</span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Level up every action you take on Closer
            </p>
          </div>
          </Link>

          :
          <div className="text-center mb-4 border dark:bg-darkGray dark:border-gray-500 rounded-md p-4 shadow-md">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            Closer <span className="text-customPink">Prime</span>
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            your plan expires at {new Date(prime.endDate).toLocaleDateString() }
          </p>
        </div>
         }

          {/* Prime Discovery */}
          <div className="space-y-4">
            
            <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300">
              Prime Discovery 
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Preferences show you people who match your vibe, but won't limit
              who you see - you will still be able to match with people outside
              your selections.
            </p>

            {/* Age Preference */}
            <div>
              
            { !prime?.isPrime &&
              <Crown size={25} className="text-customPink"/>
              }
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Age Preference 
              </label>
              
              <div className="flex items-center justify-between mt-1">
                <input
                 disabled={prime?.isPrime === false}
                  type="range"
                  min={18}
                  max={50}
                  value={ageRange[0]}
                  onChange={(e) =>
                    setAgeRange([Number(e.target.value), ageRange[1]])
                  }
                  className="w-full"
                />
                <input
                  disabled={prime?.isPrime === false}
                  type="range"
                  min={18}
                  max={50}
                  value={ageRange[1]}
                  onChange={(e) =>
                    setAgeRange([ageRange[0], Number(e.target.value)])
                  }
                  className="w-full"
                />
                
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {ageRange[0]} - {ageRange[1]}
              </p>
            </div>

            {/* Distance Preference */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Distance Preference
              </label>
              <input
                disabled={prime?.isPrime === false}
                type="range"
                min={1}
                max={100}
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full mt-1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {distance} km
              </p>
            </div>

            {/* Other Preferences */}
             <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interested In
                </label>
                <select className="w-full mt-1 py-2 text-sm border-gray-300 dark:border-gray-700 dark:bg-darkGray dark:text-gray-300 rounded-md"
                value={interestedIn}
                onChange={(e) => setInterestedIn(e.target.value)}
                disabled={prime?.isPrime === false}
                >
                <option value="">Select an option</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
                </select>
              </div>


              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Looking for
                </label>
                <select className="w-full text-sm mt-1 py-2 border-gray-300 dark:border-gray-700 dark:bg-darkGray dark:text-gray-300 rounded-md"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                disabled={prime?.isPrime === false}
                >
                <option value="">Select an option</option>
                <option value="short-term">Short-term relationship</option>
                <option value="long-term">Long-term relationship</option>
                <option value="friends">Find new friends</option>
                <option value="figuring-out">Still figuring out</option>
                </select>
              </div>

          </div>
        </section>
      </aside>

      {/* Arrow Button for Closing Sidebar */}
      {screenWidth < 1024 && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-16 left-72 z-50 p-2 rounded-full bg-gray-200 dark:bg-nightBlack border border-gray-300 shadow-lg ${
            isSidebarOpen ? "" : "hidden"
          }`}
        >
          <HiArrowLeft className="text-base text-gray-700 dark:text-white" />
        </button>
      )}
    </div>
  );
};

export default ProSidebar;
