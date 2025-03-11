import React from 'react'
import Header from '@/components/reusables/Header'
import Footer from '@/components/reusables/Footer'
import LoginForm from '@/components/reusables/LoginForm'
const Login: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen select-none caret-transparent">
        <Header htmlFor='employee'/>
            <div className="h-[100vh] items-center flex justify-center px-5 lg:px-0">
            <div className="max-w-screen-xl bg-white dark:bg-darkGray border dark:border-darkGray shadow sm:rounded-lg flex justify-center flex-1">
            <div className="flex-1 bg-white  dark:bg-darkGray text-center hidden md:flex">
                <div
                className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(https://img.freepik.com/free-vector/data-inform-illustration-concept_114360-864.jpg)`,
                }}
                ></div>
            </div>
            
            <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
                <div className=" flex flex-col items-center">
                <div className="text-center">
                    <h1 className="text-2xl xl:text-4xl font-extrabold text-customPink  dark:text-lightGray">
                    Sign in as Employee
                    </h1>
                    <p className="text-[12px] text-gray-500  dark:text-lightGray">
                    Hello Employee enter your credentials to login
                    </p>
                </div>

                 <LoginForm htmlFor='employee'/>

                </div>
            </div>
            </div>
            </div>
        <Footer htmlFor="employee"/>
    </div>
  )
}

export default Login