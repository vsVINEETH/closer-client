import React from 'react'
import Header from '@/components/user/Header'
import Footer from '@/components/user/Footer'
import Otp from '@/components/user/Otp'

const OtPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
    <Header/>
    
     <div className="h-[100vh] items-center flex justify-center px-5 lg:px-0">
      <div className="max-w-screen-xl bg-white dark:bg-darkGray border dark:border-darkGray shadow sm:rounded-lg flex justify-center flex-1">
        <div className="flex-1 bg-white  dark:bg-darkGray border dark:border-darkGray text-center hidden md:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat "
            style={{
              backgroundImage: `url(https://img.freepik.com/free-vector/conversation-concept-illustration_114360-1102.jpg)`,
            }}
          ></div>
        </div>
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 ">
          <div className=" flex flex-col items-center">
            <div className="text-center ">
              <h1 className="text-2xl xl:text-4xl font-extrabold text-customPink dark:text-lightGray">
                Please enter the OTP
              </h1>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Hey enter your one time password to verify
              </p>
            </div>
            <div className="w-full flex-1 ">
              <div className="mx-auto max-w-xs flex flex-col gap-4">
                
                <Otp/>
                
              </div>
            </div>
          </div>
        </div>
      </div>
     </div>

    <Footer/>
    </div>
  )
}

export default OtPage