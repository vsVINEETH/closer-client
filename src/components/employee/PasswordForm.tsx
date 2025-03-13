'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { errorToast, successToast } from '@/utils/toasts/toast';
import { useAuth } from '@/hooks/authHooks/useEmployeAuth';

interface Errors {
  currentPassword?: string,
  newPassword?: string,
  confirmPassword?: string,
  notFound?: string,
  // inputOtp?: string,
}

interface FormData {
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
}

export default function PasswordForm() {

  const [formData, setFormData] = useState<FormData>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState<Errors>({})
  const {changePassword} = useAuth()

  const employeeId = useSelector((state: RootState) => state?.employee.employeeInfo?.id);
  const employeeInfo = useSelector((state: RootState) => state?.employee.employeeInfo)


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError({})

    if (validation() && employeeId) {
      const response = await changePassword(employeeId, formData);

      if (response.data) {
        successToast(response.data.message)
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    }

  };

  const validation = (): boolean => {

    const newErrors: Errors = {};
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "This Field is required"
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "This Field is required"
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "This Field is required"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password mismatch';
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0
  }


  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-darkGray shadow-lg border dark:border-darkGray rounded-lg px-8 pt-8 pb-10 mb-6">
     
        <>
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-lightGray text-center mb-6">Change Password</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="current-password" className="block text-gray-700 dark:text-lightGray font-medium mb-2">Current Password</label>
              <input
                id="current-password"
                name='currentPassword'
                type="password"
                onChange={handleChange}
                required
                className="w-full border rounded-lg py-2 px-4 text-gray-700 dark:text-white bg-gray-100 dark:bg-nightBlack focus:outline-none focus:ring-2 focus:ring-customPink dark:focus:ring-gray-50"
              />
              {error?.currentPassword && <p className="text-red-500 text-xs text-center">{error.confirmPassword}</p>}

            </div>
            <div>
              <label htmlFor="new-password" className="block text-gray-700 dark:text-lightGray font-medium mb-2">New Password</label>
              <input
                id="new-password"
                name='newPassword'
                type="password"
                onChange={handleChange}
                required
                className="w-full border rounded-lg py-2 px-4 text-gray-700 dark:text-white bg-gray-100 dark:bg-nightBlack focus:outline-none focus:ring-2 focus:ring-customPink dark:focus:ring-gray-50"
              />
            {error?.newPassword && <p className="text-red-500 text-sm text-center">{error.newPassword}</p>}

            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-gray-700 dark:text-lightGray font-medium mb-2">Confirm New Password</label>
              <input
                id="confirm-password"
                name='confirmPassword'
                type="password"
                onChange={handleChange}
                required
                className="w-full border rounded-lg py-2 px-4 text-gray-700 dark:text-white bg-gray-100 dark:bg-nightBlack focus:outline-none focus:ring-2 focus:ring-customPink dark:focus:ring-gray-50"
              />
            {error?.confirmPassword && <p className="text-red-500 text-sm text-center">{error.confirmPassword}</p>}

            </div>
      
            <button
              type="submit"
              className="w-full bg-customPink hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-500 text-white font-semibold py-3 rounded-lg transition-all"
            >
              Change Password
            </button>
          </form>
        </>
    </div>
  )
}