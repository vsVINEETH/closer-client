"use client";
import React from "react";
import {useForm} from 'react-hook-form';
import Link from "next/link";
import {z} from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema  } from "@/schemas/loginSchema";
import { useAuth as userUseAuth } from "@/hooks/authHooks/useUserAuth";
import {useAuth as adminUseAuth} from '@/hooks/authHooks/useAdminAuth';
import { useAuth as employeeUseAuth } from "@/hooks/authHooks/useEmployeAuth";
import { useTranslations } from "next-intl";
import Auth from "../user/forms/Auth";

type LoginCrendentialsTypes = z.infer<typeof loginSchema>;

interface LoginProps {
    htmlFor: string; 
  };

const LoginForm: React.FC<LoginProps> = ({ htmlFor }) => {
      const t = useTranslations('Login');
      const { register, handleSubmit, formState: { errors }, clearErrors, setValue} = useForm<LoginCrendentialsTypes>({ resolver: zodResolver(loginSchema),});
      let useAuth;
      if(htmlFor === 'user'){
        useAuth = userUseAuth
      }else if(htmlFor === 'admin'){
        useAuth = adminUseAuth
      }else {
        useAuth = employeeUseAuth
      };

      const {handleLogin} = useAuth();

      const onSubmit = async (loginCrendentials:LoginCrendentialsTypes) => {
        await handleLogin(loginCrendentials)
    };
  
    type FieldName = "email" | "password";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      
      if (name === "email" || name === "password") {
        setValue(name as FieldName, value);
        clearErrors(name); 
      }
    };
    

      return (
        <div className="w-full flex-1 mt-8">
    
          <form
            className="mx-auto max-w-xs flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <input
              className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              type="email"
              placeholder={t('email')}
              {...register('email')}
              onChange={handleChange}
            />
            {errors.email && <span className="text-red-600">{errors.email.message}</span>}
    
            <input
              className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              type="password"
              placeholder={t('password')}
              {...register('password')}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="text-red-600">{errors.password.message}</span>
            )}
    
       { htmlFor === 'user' &&           
            <div className="flex items-center">
              <hr className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500 dark:text-gray-300">or</span>
              <hr className="flex-grow border-t border-gray-300" />
            </div>}
    
            {htmlFor === 'user' && <Auth /> }
           
    
            <button
              className="mt-5 tracking-wide font-semibold bg-customPink  text-gray-100 w-full py-4 rounded-lg hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-500 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
              type="submit"
            >
              <span className="ml-3">{t('signIn')}</span>
            </button>
    
    { htmlFor === 'user' &&
            <p className="mt-6 text-xs text-gray-600 text-center dark:text-gray-400">
              {t('noAccount')}{" "}
              <Link
                href="/user/signup"
                className="text-customPink font-semibold dark:text-lightGray "
              >
                {t('signUp')}
                
              </Link>
              
            </p>
            }
          </form>
       { htmlFor === 'user' && 
          <Link href='/user/forgot'>
          <p className=" text-xs cursor-pointer text-gray-600 text-center dark:text-gray-400">{t('forgotPassword')}</p>
          </Link>
     }
        </div>
      );
      
};

export default LoginForm;