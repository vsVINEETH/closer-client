"use client";

import React, { useEffect, useRef, useState } from "react";

interface OtpProps {
  otpLength?: number;
  initialTimer?: number;
  onResend: () => Promise<void>;
  onSubmit: (otp: string[]) => Promise<void>;
  errorMessage?: string;
  successMessage?: string;
}

const Otps: React.FC<OtpProps> = ({
  otpLength = 4,
  initialTimer = 59,
  onResend,
  onSubmit,
  errorMessage = "Something went wrong. Please try again.",
}) => {
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(""));
  const [errors, setErrors] = useState<string | null>(null);
  const [show, setShow] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(initialTimer);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const timerId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timerId);
    }
    setShow(false);
  }, [timer]);

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
    if (!new RegExp(`^[0-9]{${otpLength}}$`).test(text)) {
      return;
    }
    const digits = text.split("");
    setOtp(digits);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isValid = otp.every((digit) => digit.trim() !== "");
    if (!isValid) {
      setErrors("Please enter all fields");
      return;
    }
    setErrors(null);
    try {
      await onSubmit(otp);
    } catch {
      setErrors(errorMessage);
    }
  };

  const handleResend = async () => {
    try {
      setTimer(initialTimer);
      setShow(true);
      await onResend();
    } catch {
      setErrors(errorMessage);
    }
  };

  return (
    <section className="bg-white py-10 dark:bg-darkGray dark:border-darkGray">
      <div>
        <p className="mb-1.5 text-sm font-xs text-gray-400">
          Secure code{" "}
          {errors && <span className="text-red-500">{errors}</span>}
        </p>
        <form
          id="otp-form"
          className="flex flex-wrap gap-4"
          onSubmit={handleSubmit}
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

          <button
            className="tracking-wide font-semibold bg-customPink dark:bg-nightBlack dark:hover:bg-gray-500 text-gray-100 w-full py-4 rounded-lg hover:bg-customPink transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
            type="submit"
          >
            <span className="p-1">Verify OTP</span>
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-gray-600 dark:text-lightGray text-center">
        Haven't received an OTP ?{" "}
        {show && (
          <span className="text-customPink dark:text-lightGray font-semibold">
            {" "}
            {timer}:00 seconds left
          </span>
        )}
        {!show && (
          <span
            className="text-customPink dark:text-lightGray font-semibold cursor-pointer"
            onClick={handleResend}
          >
            {" "}
            Resend OTP
          </span>
        )}
      </p>
    </section>
  );
};

export default Otps;
