'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';
import Otp from '../user/Otp';
import useAxios from '@/hooks/useAxios/useAxios';
import { errorToast, successToast } from '@/utils/toasts/toats';

interface Errors {
  currentPassword?: string,
  newPassword?: string,
  confirmPassword?: string,
  notFound?: string,
  inputOtp?: string,
}

interface FormData {
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
}

export default function PasswordForm() {

  const [formData, setFormData] = useState<FormData>({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState<Errors>({})
  const [success, setSuccess] = useState<boolean>(false)

  const [otp, setOtp] = useState<string[]>(Array(4).fill("")); // Array with 4 empty strings
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]); // Array of refs for each input field
  const [errors, setErrors] = useState<Errors>({});
  const [show, setShow] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(59);
  const router = useRouter();
  const [otpSend, setOtpSend] = useState<boolean>(false);
  const { handleRequest } = useAxios()

  const employeeId = useSelector((state: RootState) => state.employee.employeeInfo?.id);
  const employeeInfo = useSelector((state: RootState) => state.employee.employeeInfo)


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError({});
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError({})
    setSuccess(false)

    if (validation()) {
      console.log('Password change requested:')
      const response = await handleRequest({
        url: '/api/employee/change_password',
        method: 'POST',
        data: {
          id: employeeInfo?.id,
          formData: formData
        }
      });

      if (response.error) {
        errorToast(response.error);
        setError({ notFound: 'Invalid emp id' })
      }
      if (response.data) {
        setOtpSend(true);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    }

  }

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
      newErrors.newPassword = 'Password mismatch';
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0
  }



  //OTP
  useEffect(() => {
    if (timer > 0) {
      const timerId = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(timerId)
    }
    setShow(false)
  }, [timer])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      !e.metaKey
    ) {
      e.preventDefault();
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      const index = inputRefs.current.indexOf(e.currentTarget);
      if (index > 0) {
        setOtp((prevOtp) => [
          ...prevOtp.slice(0, index - 1),
          "",
          ...prevOtp.slice(index),
        ]);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const index = inputRefs.current.indexOf(target);
    if (target.value) {
      setOtp((prevOtp) => [
        ...prevOtp.slice(0, index),
        target.value,
        ...prevOtp.slice(index + 1),
      ]);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (!new RegExp(`^[0-9]{${otp.length}}$`).test(text)) {
      return;
    }
    const digits = text.split("");
    setOtp(digits);
  };

  const handleSubmitOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpSend(true);
    if (validateOTP()) {
      try {
        const response = await handleRequest({
          url: '/api/employee/verify',
          method: 'POST',
          data: {
            email: employeeInfo?.email, otp
          }
        });

        if (response.error) {
          setErrors({ inputOtp: 'Incorrect OTP' });
          errorToast(response.error)
        }

        if (response.data) {
          successToast('password updated')
          setFormData({ currentPassword: "", newPassword: '', confirmPassword: '' });
          setOtp(Array(4).fill(""));
          setOtpSend(false);
        }
      } catch (error) {
        setErrors({ inputOtp: 'Something went wrong. Please try again.' });
        errorToast('Something went wrong. Please try again.')
        console.error('Error during OTP verification:', error);
      }
    } else {
      setErrors({ inputOtp: 'Please enter a valid OTP' });
    }
  };

  const handleResend = async () => {
    try {
      setTimer(59);
      setShow(true);

      const response = await handleRequest({
        url: '/api/employee/resend',
        method: 'POST',
        data: {
          email: employeeInfo?.email
        }
      });

      if (response.error) {
        errorToast(response.error);
      }

      if (response.data) {
        successToast(response.data);
      }

    } catch (error) {
      setErrors({ inputOtp: 'Something went wrong. Please try again.' });
      console.error('Error during OTP verification:', error);
    }
  }

  const validateOTP = (): boolean => {
    const newErrors: Errors = {}
    otp.forEach(element => {
      if (!element.trim()) {
        newErrors.inputOtp = 'Fields are empty'
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }


  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-darkGray shadow-md  border dark:border-darkGray rounded px-8 pt-6 pb-8 mb-4">
      {!otpSend ?
        <>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-lightGray">Change Password</h2>
          {error && error.notFound && <p>{error.notFound}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="current-password" className="block text-gray-700 text-sm font-semibold mb-2 dark:text-lightGray">
                Current Password
              </label>
              <input
                id="current-password"
                name='currentPassword'
                type="text"
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-gray-700 text-sm font-semibold mb-2 dark:text-lightGray">
                New Password
              </label>
              <input
                id="new-password"
                name='newPassword'
                type="text"
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-semibold mb-2 dark:text-lightGray">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name='confirmPassword'
                type="text"
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm" role="alert">
                {error.currentPassword}
              </div>
            )}
            {success && (
              <div className="text-green-500 text-sm" role="alert">
                Password changed successfully!
              </div>
            )}
            <div>
              <button
                type="submit"
                className="w-full bg-customPink hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Change Password
              </button>
            </div>
          </form>
        </>
        :
        <>

          <section className="bg-white  py-10  dark:bg-darkGray dark:border-darkGray">
            <span onClick={() => setOtpSend(false)} className='mb-14'>Back</span>
            <h1 className="text-2xl xl:text-4xl font-extrabold text-customPink dark:text-lightGray">Please Enter your OTP</h1>
            <div >

              <p className="mb-1.5 text-sm font-xs text-gray-400">
                Secure code {errors && <span className="text-red-500">{errors.inputOtp}</span>}
              </p>
              <form id="otp-form"
                className="flex flex-wrap gap-4"
                onSubmit={handleSubmitOTP}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onPaste={handlePaste}
                    ref={(el) => {
                      if (el) {
                        inputRefs.current[index] = el;
                      }
                    }}
                    className="shadow-xs flex w-[66px] items-center justify-center rounded-lg border border-stroke bg-white p-2 text-center text-2xl font-medium text-gray-5 outline-none sm:text-4xl dark:text-white dark:border-dark-3 dark:bg-white/5"
                  />
                ))}

                <button className="tracking-wide font-semibold bg-customPink dark:bg-nightBlack dark:hover:bg-gray-500 text-gray-100 w-full py-4 rounded-lg hover:bg-customPink transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  type="submit"
                >
                  <span className="p-1">Verify OTP</span>
                </button>
              </form>
            </div>

            <p className="mt-6 text-xs text-gray-600 dark:text-lightGray text-center">
              Haven't received an OTP ?{" "}
              {show && <span className="text-customPink dark:text-lightGray font-semibold"> {timer}:00 seconds left</span>}
              {!show && <span className="text-customPink dark:text-lightGray font-semibold cursor-pointer" onClick={handleResend} > Resend OTP</span>}
            </p>
          </section>
        </>
      }
    </div>
  )
}