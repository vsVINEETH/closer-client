"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAxios from "@/hooks/axiosHooks/useAxios";
import { warnToast } from "@/utils/toasts/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/schemas/user/signupSchema";
import { z } from "zod";

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, clearErrors} = useForm<SignupFormData>({ resolver: zodResolver(signupSchema),});

  const { handleRequest } = useAxios();
  const router = useRouter();

  const onSubmit = async (data: SignupFormData) => {
      localStorage.setItem("email", data.email);

      const response = await handleRequest({
        url: "/api/user/signup",
        method: "POST",
        data: data,
      });

      if (response.error) {
        warnToast(response.error);
      }

      if (response.data) {
        router.push("/user/signup/otp");
      }
  };

  const handleInputChange = () => {
    clearErrors();
  };

  return (
    <div className="w-full flex-1 mt-8">
      <form
        className="mx-auto max-w-xs flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="text"
          placeholder="Enter your name"
          {...register("username")}
          onChange={handleInputChange}
        />
        {errors.username && (
          <span className="text-red-600">{errors.username.message}</span>
        )}

        <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          onChange={handleInputChange}
        />
        {errors.email && <span className="text-red-600">{errors.email.message}</span>}

        <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="tel"
          placeholder="Enter your phone"
          {...register("phone")}
          onChange={handleInputChange}
        />
        {errors.phone && <span className="text-red-600">{errors.phone.message}</span>}

        <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="password"
          placeholder="Password"
          {...register("password")}
          onChange={handleInputChange}
        />
        {errors.password && (
          <span className="text-red-600">{errors.password.message}</span>
        )}

        <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword")}
          onChange={handleInputChange}
        />
        {errors.confirmPassword && (
          <span className="text-red-600">{errors.confirmPassword.message}</span>
        )}

        <button
          className="mt-5 tracking-wide font-semibold bg-customPink  text-gray-100 w-full py-4 rounded-lg hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-500 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
          type="submit"
        >
          <svg
            className="w-6 h-6 -ml-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <path d="M20 8v6M23 11h-6" />
          </svg>
          <span className="ml-3">Sign Up</span>
        </button>
        <p className="mt-6 text-xs text-gray-600 text-center dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/user/login"
            className="text-customPink font-semibold dark:text-lightGray "
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
