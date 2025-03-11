'use client'
import React, { useState } from 'react';
import useAxios from '@/hooks/axiosHooks/useAxios';
import { warnToast, successToast } from '@/utils/toasts/toast';
import { useRouter } from 'next/navigation';

interface Errors {
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
  notFound?: string;
}

interface FormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}


const ForgotPassword: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<Errors>({});
  const { handleRequest } = useAxios();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError({});
    try {
      if (validation()) {
        localStorage.setItem("email", formData.email);
        const response = await handleRequest({
          url: "/api/user/forgot_password",
          method: "POST",
          data: {
            formData: formData,
          },
        });

        if (response.error) {
          warnToast(response.error);
        }

        if (response.data) {
          router.push('/user/forgot/otp')
          successToast(response.data.message);
          setFormData({
            email: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      }
    } catch (error) {
      console.error(error)
      setError({ notFound: "Invalid current password" });
    }
  };

  const validation = (): boolean => {
    const newErrors: Errors = {};
    const emailRegex: RegExp =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.email.trim()) {
      newErrors.email = "This Field is required";
    }else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "This Field is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "This Field is required";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.newPassword = "Password mismatch";
    }

    setError(newErrors);
    console.log(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-darkGray  rounded px-8 pt-6 pb-8 mb-4">

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-semibold mb-2 dark:text-lightGray"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            name="email"
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {error.email && (
            <span className="text-red-500">{error.email}</span>
          )}
        </div>
        <div>
          <label
            htmlFor="new-password"
            className="block text-gray-700 text-sm font-semibold mb-2 dark:text-lightGray"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="text"
            value={formData.newPassword}
            name="newPassword"
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {error.newPassword && (
            <span className="text-red-500">{error.newPassword}</span>
          )}
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-gray-700 text-sm font-semibold mb-2 dark:text-lightGray"
          >
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="text"
            value={formData.confirmPassword}
            name="confirmPassword"
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {error.confirmPassword && (
            <span className="text-red-500">{error.confirmPassword}</span>
          )}
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-customPink hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Change Password
          </button>
          {/* <Link
            href="/user/login"
            className="text-customPink font-semibold dark:text-lightGray "
          >
            Sign in
          </Link> */}
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
