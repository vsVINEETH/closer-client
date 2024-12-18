"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useAxios from "@/hooks/useAxios/useAxios";
import { successToast, warnToast } from "@/utils/toasts/toats";

interface Errors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  notFound?: string;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function PasswordForm() {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<Errors>({});
  const { handleRequest } = useAxios();

  const userInfo = useSelector((state: RootState) => state.user.userInfo);

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
        const response = await handleRequest({
          url: "/api/user/change_password",
          method: "POST",
          data: {
            id: userInfo?.id,
            formData: formData,
          },
        });

        if (response.error) {
          warnToast(response.error);
        }

        if (response.data) {
          successToast(response.data.message);
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      }
    } catch (error) {
      setError({ notFound: "Invalid current password" });
    }
  };

  const validation = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "This Field is required";
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
    <div className="w-full max-w-md mx-auto bg-white dark:bg-darkGray border dark:border-darkGray shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-lightGray">
        Change Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="current-password"
            className="block text-gray-700 text-sm font-semibold mb-2 dark:text-lightGray"
          >
            Current Password
          </label>
          <input
            id="current-password"
            type="text"
            value={formData.currentPassword}
            name="currentPassword"
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {error.currentPassword && (
            <span className="text-red-500">{error.currentPassword}</span>
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
        </div>
      </form>
    </div>
  );
}
