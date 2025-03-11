"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { successToast} from "@/utils/toasts/toast";
import { useSecurity } from "@/hooks/crudHooks/user/useSecurity";

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
  const {changePassword} = useSecurity();

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
        if(!userInfo?.id) return;
        const response = await changePassword(userInfo?.id, formData);

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
      console.error(error)
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
<div className="w-full max-w-md mx-auto bg-white dark:bg-darkGray border dark:border-darkGray shadow-lg rounded-lg p-8">
  <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-lightGray mb-6">
    Change Password
  </h2>
  <form onSubmit={handleSubmit} className="space-y-5">
    <div className="flex flex-col gap-1">
      <label
        htmlFor="current-password"
        className="text-gray-700 text-sm font-semibold dark:text-lightGray"
      >
        Current Password
      </label>
      <input
        id="current-password"
        type="password"
        value={formData.currentPassword}
        name="currentPassword"
        onChange={handleChange}
        required
        className="border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-white bg-gray-50 dark:bg-darkGray focus:ring-2 focus:ring-customPink outline-none transition"
      />
      {error.currentPassword && (
        <span className="text-red-500 text-xs mt-1">{error.currentPassword}</span>
      )}
    </div>

    <div className="flex flex-col gap-1">
      <label
        htmlFor="new-password"
        className="text-gray-700 text-sm font-semibold dark:text-lightGray"
      >
        New Password
      </label>
      <input
        id="new-password"
        type="password"
        value={formData.newPassword}
        name="newPassword"
        onChange={handleChange}
        required
        className="border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-white bg-gray-50 dark:bg-darkGray focus:ring-2 focus:ring-customPink outline-none transition"
      />
      {error.newPassword && (
        <span className="text-red-500 text-xs mt-1">{error.newPassword}</span>
      )}
    </div>

    <div className="flex flex-col gap-1">
      <label
        htmlFor="confirm-password"
        className="text-gray-700 text-sm font-semibold dark:text-lightGray"
      >
        Confirm New Password
      </label>
      <input
        id="confirm-password"
        type="password"
        value={formData.confirmPassword}
        name="confirmPassword"
        onChange={handleChange}
        required
        className="border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-white bg-gray-50 dark:bg-darkGray focus:ring-2 focus:ring-customPink outline-none transition"
      />
      {error.confirmPassword && (
        <span className="text-red-500 text-xs mt-1">{error.confirmPassword}</span>
      )}
    </div>

    <button
      type="submit"
      className="w-full bg-customPink hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-customPink"
    >
      Change Password
    </button>
  </form>
</div>

  );
}
