'use client'

import React, {useState, useEffect} from 'react'
import { login } from '@/store/slices/adminSlice';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import useAxios from '@/hooks/useAxios/useAxios';
import { errorToast } from '@/utils/toasts/toats';

interface FormData {
  email: string;
  password: string;
}

interface Errors {
  email?: string;
  password?: string;
}

  const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ email:"", password:"" });
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter()
  const dispatch = useDispatch();
  const {handleRequest} = useAxios();

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if(!formData.email.trim()){
      newErrors.email = 'Email is required';
      
    } else if (!emailRegex.test(formData.email)){
      newErrors.email = 'Email is invaild'
    }

    if(!formData.password){
      newErrors.password = "Password is required";
    } 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
       ...prev,
       [name] : value

    }))

    setErrors({});
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if ( validateForm() ) {
      console.log(formData);
      try {
        const response = await handleRequest({
          url:'/api/admin/login',
          method:'POST',
          data:formData
        });

        if(response.error){
          errorToast(response.error)
        }

        if(response.data){
          const admin = response.data.admin
          dispatch(
            login({id: admin.id, email: admin.email})
          );
          router.push('/admin/dashboard')
        }

      } catch (error) {
        errorToast(error)
      }
    } else {
      errorToast('Something happend')
    }
    
  }


    return (
      <div className="w-full flex-1 mt-8">
      <form className="mx-auto max-w-xs flex flex-col gap-4"
            onSubmit={handleSubmit}
      >

      <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="email"
          placeholder="Enter your email"
          name='email'
          onChange={handleChange}
      />
      {errors.email && <span className='text-red-600'>{errors.email}</span>}

      <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="password"
          placeholder="Password"
          name='password'
          onChange={handleChange}
      />
      {errors.password && <span className='text-red-600'>{errors.password}</span>}

      <button 
          className="mt-5 tracking-wide font-semibold bg-customPink  text-gray-100 w-full py-4 rounded-lg hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-500 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
          type='submit'
          >
          <span className="ml-3">Sign In</span>
      </button>

      </form>
    </div>
    )
  }

export default LoginForm