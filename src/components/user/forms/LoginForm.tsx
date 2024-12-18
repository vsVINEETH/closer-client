"use client";
import React, { useEffect, useState } from "react";
import { login } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAxios from "@/hooks/useAxios/useAxios";
import { errorToast } from "@/utils/toasts/toats";
import ForgotPassword from "./ForgotPassoword";
import Auth from "./Auth";


interface FormData {
  email: string;
  password: string;
}

interface Errors {
  email?: string;
  password?: string;
}



const LoginForm: React.FC = () => {
  const {  handleRequest } = useAxios();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validation()) {
      const response = await handleRequest({
        url: "/api/user/login",
        method: "POST",
        data: formData,
      });

      if (response.error) {
        errorToast(response.error);
      }

      if (response.data) {
        const { user } = response.data;
        console.log(user)
        if (user.setupCompleted && !user.isBlocked) {
          dispatch(
            login({
              id: user.id,
              username: user.username,
              email: user.email,
              image: user.image,
              phone: user.phone,
              birthday: user.dob,
              lookingFor: user.lookingFor,
              interestedIn: user.interestedIn,
              prime: user.prime
            })
          );
          router.push("/user/home");
        } else {
          router.push("/user/setup");
        }
      }
    } else {
      console.log("oops");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors({});
  };

  const validation = (): boolean => {
    const newErrors: Errors = {};
    const emailRegex: RegExp =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="w-full flex-1 mt-8">

      <form
        className="mx-auto max-w-xs flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="email"
          placeholder="Enter your email"
          name="email"
          onChange={handleChange}
        />
        {errors.email && <span className="text-red-600">{errors.email}</span>}

        <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="password"
          placeholder="Password"
          name="password"
          onChange={handleChange}
        />
        {errors.password && (
          <span className="text-red-600">{errors.password}</span>
        )}

        <div className="flex items-center">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500 dark:text-gray-300">or</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <Auth />
       

        <button
          className="mt-5 tracking-wide font-semibold bg-customPink  text-gray-100 w-full py-4 rounded-lg hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-500 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
          type="submit"
        >
          <span className="ml-3">Sign In</span>
        </button>

        <p className="mt-6 text-xs text-gray-600 text-center dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/user/signup"
            className="text-customPink font-semibold dark:text-lightGray "
          >
            Sign up
            
          </Link>
          
        </p>
        
      </form>
      <Link href='/user/forgot'>
      <p className=" text-xs cursor-pointer text-gray-600 text-center dark:text-gray-400">forgot password ?</p>
      </Link>
    </div>
  );
};

export default LoginForm;
