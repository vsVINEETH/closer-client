'use client';
import React, { useState } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const ProSidebar: React.FC = () => {
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 30]);
  const [distance, setDistance] = useState<number>(1);
  const [showOnlyAgeRange, setShowOnlyAgeRange] = useState(false);
  const [showOnlyDistanceRange, setShowOnlyDistanceRange] = useState(false);
  const [minPhotos, setMinPhotos] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const prime = useSelector((state: RootState) => state.user.userInfo?.prime)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="lg:w-96">
      {/* Arrow Button for Opening Sidebar */}
      <button
        onClick={toggleSidebar}
        className={`lg:hidden fixed top-16 left-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-nightBlack border border-gray-300 shadow-lg ${
          isSidebarOpen ? "hidden" : ""
        }`}
      >
        <HiArrowRight className="text-base text-gray-700 dark:text-white" />
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:block fixed top-16 left-0 z-40 min-h-[calc(100vh-64px)] w-72 transform border-r dark:border-gray-800 flex-shrink-0 border-gray-300 bg-white dark:bg-nightBlack transition-all duration-300 ease-in-out lg:static lg:min-h-full lg:w-96 lg:block`}
      >
        <section className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md w-full">
          {/* Header */}
          {!prime?.isPrime ?
          <Link href='/user/subscription'>
          <div className="text-center mb-4 border rounded-md p-4 shadow-md">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">
              Closer <span className="text-customPink">Prime</span>
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Level up every action you take on Closer
            </p>
          </div>
          </Link>

          :
          <div className="text-center mb-4 border rounded-md p-4 shadow-md">
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
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Prime Discovery
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Preferences show you people who match your vibe, but won’t limit
              who you see – you will still be able to match with people outside
              your selections.
            </p>

            {/* Age Preference */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Age Preference
              </label>
              <div className="flex items-center justify-between mt-1">
                <input
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
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={showOnlyAgeRange}
                  onChange={() => setShowOnlyAgeRange(!showOnlyAgeRange)}
                  className="mr-2"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Only show people in this range
                </span>
              </div>
            </div>

            {/* Distance Preference */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Distance Preference
              </label>
              <input
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
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={showOnlyDistanceRange}
                  onChange={() =>
                    setShowOnlyDistanceRange(!showOnlyDistanceRange)
                  }
                  className="mr-2"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Only show people in this range
                </span>
              </div>
            </div>

            {/* Minimum Number of Photos */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Minimum Number of Photos
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={minPhotos}
                onChange={(e) => setMinPhotos(Number(e.target.value))}
                className="w-full mt-1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {minPhotos}
              </p>
            </div>

            {/* Other Preferences */}
            {[
              "Interested in",
              "Location",
              "Interests",
              "Looking for",
              "Language",
            ].map((label, index) => (
              <div key={index}>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </label>
                <select className="w-full mt-1 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md">
                  <option>Select</option>
                  {/* Add specific options here */}
                </select>
              </div>
            ))}
          </div>
        </section>
      </aside>

      {/* Arrow Button for Closing Sidebar */}
      <button
        onClick={toggleSidebar}
        className={`lg:hidden fixed top-16 left-72 z-50 p-2 rounded-full bg-gray-200 dark:bg-nightBlack border border-gray-300 shadow-lg ${
          isSidebarOpen ? "" : "hidden"
        }`}
      >
        <HiArrowLeft className="text-base text-gray-700 dark:text-white" />
      </button>
    </div>
  );
};

export default ProSidebar;
