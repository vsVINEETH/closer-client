"use client";
import React, { useState} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAxios from "@/hooks/useAxios/useAxios";
import { warnToast } from "@/utils/toasts/toats";

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const { loading, handleRequest } = useAxios();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validation()) {
      localStorage.setItem("email", formData.email);
      const response = await handleRequest({
        url: "/api/user/signup",
        method: "POST",
        data: formData,
      });

      if (response.error) {
        warnToast(response.error);
      }

      if (response.data) {
        router.push("/user/signup/otp");
      }
    }
  };

  const validation = (): boolean => {
    const newErrors: Errors = {};
    const emailRegex: RegExp =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.username.trim()) {
      newErrors.username = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password mismatch...";
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
          type="text"
          placeholder="Enter your name"
          name="username"
          onChange={handleChange}
        />
        {errors.username && (
          <span className="text-red-600">{errors.username}</span>
        )}

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
          type="tel"
          placeholder="Enter your phone"
          name="phone"
          onChange={handleChange}
        />
        {errors.phone && <span className="text-red-600">{errors.phone}</span>}

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

        <input
          className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <span className="text-red-600">{errors.confirmPassword}</span>
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
