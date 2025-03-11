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
  const [otpSend, setOtpSend] = useState<boolean>(false);
  const {changePassword, validateOTP, resendVerificationCode} = useAuth()

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
    setSuccess(false)

    if (validation() && employeeId) {
      const response = await changePassword(employeeId, formData);

      if (response.error) {
        setError({ notFound: 'Invalid emp id' })
      }

      if (response.data) {
        setOtpSend(true);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    }

  };

  const handleSubmitOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpSend(true);
    if (validatationForOTP() && employeeInfo?.email) {
      try {
        const response = await validateOTP(employeeInfo.email, otp);

        if (response.error) {
          setErrors({ inputOtp: 'Incorrect OTP' });
        }

        if (response.data) {
          successToast('password updated')
          setFormData({ currentPassword: "", newPassword: '', confirmPassword: '' });
          setOtp(Array(4).fill(""));
          setOtpSend(false);
        }
      } catch (error) {
        console.error(error)
        setErrors({ inputOtp: 'Something went wrong. Please try again.' });
        errorToast('Something went wrong. Please try again.');
      }
    } else {
      setErrors({ inputOtp: 'Please enter a valid OTP' });
    }
  };

  const handleResend = async () => {
    try {
      setTimer(59);
      setShow(true);

      if(!employeeInfo?.email){return}
      const response = await resendVerificationCode(employeeInfo.email)

      if (response.data) {
        successToast(response.data);
      }

    } catch (error) {
      setErrors({ inputOtp: 'Something went wrong. Please try again.' });
      console.error('Error during OTP verification:', error);
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

  const validatationForOTP = (): boolean => {
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
    <div className="w-full max-w-md mx-auto bg-white dark:bg-darkGray shadow-lg border dark:border-darkGray rounded-lg px-8 pt-8 pb-10 mb-6">
      {!otpSend ? (
        <>
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-lightGray text-center mb-6">Change Password</h2>
          {error?.notFound && <p className="text-red-500 text-sm text-center">{error.notFound}</p>}
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
            </div>
            {error?.currentPassword && <div className="text-red-500 text-sm text-center">{error.currentPassword}</div>}
            {success && <div className="text-green-500 text-sm text-center">Password changed successfully!</div>}
            <button
              type="submit"
              className="w-full bg-customPink hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-500 text-white font-semibold py-3 rounded-lg transition-all"
            >
              Change Password
            </button>
          </form>
        </>
      ) : (
        <section className="py-10">
          <button onClick={() => setOtpSend(false)} className="text-customPink dark:text-lightGray font-semibold text-sm mb-6">&#8592; Back</button>
          <h1 className="text-3xl font-extrabold text-center text-customPink dark:text-lightGray mb-4">Enter Your OTP</h1>
          <p className="text-gray-500 dark:text-lightGray text-center text-sm mb-6">Secure code {errors?.inputOtp && <span className="text-red-500">{errors.inputOtp}</span>}</p>
          <form id="otp-form" className="flex justify-center gap-3 mb-4" onSubmit={handleSubmitOTP}>
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
                ref={(el) => { if (el) inputRefs.current[index] = el; }}
                className="w-12 h-12 text-center text-2xl font-medium border rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-customPink"
              />
            ))}
          </form>
          <button
            className="w-full bg-customPink hover:bg-red-500 dark:bg-nightBlack dark:hover:bg-gray-500 text-white font-semibold py-3 rounded-lg transition-all"
            type="submit"
          >
            Verify OTP
          </button>
          <p className="mt-6 text-sm text-center text-gray-600 dark:text-lightGray">
            Haven't received an OTP? {show ? <span className="text-customPink font-semibold">{timer}:00 seconds left</span> : <span className="text-customPink font-semibold cursor-pointer" onClick={handleResend}>Resend OTP</span>}
          </p>
        </section>
      )}
    </div>
  )
}