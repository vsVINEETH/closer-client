
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { errorToast, successToast } from "@/utils/toasts/toast";
import { useSecurity } from "@/hooks/crudHooks/user/useSecurity";


interface Errors {
  inputOtp?: string;
}

const Otp: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [show, setShow] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(59);
  const {validateOTPSignup, resendVerificationCodeSignup} = useSecurity()
  const router = useRouter();

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
    if (!new RegExp(`^[0-9]{${otp.length}}$`).test(text)) {
      return;
    }
    const digits = text.split("");
    setOtp(digits);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const email = localStorage.getItem("email");
        if(!email) return;
        const response = await validateOTPSignup(email, otp);

        if(response.error){
          setOtp(Array(4).fill(""));
          errorToast('Invalid OTP')
        }

        if(response.data){
          router.push("/user/setup");
          successToast('OTP validated successfully')
        }
      } catch (error) {
        setErrors({ inputOtp: "Something went wrong. Please try again." });
        console.error("Error during OTP verification:", error);
      }
    } else {
      setErrors({ inputOtp: "Please enter a valid OTP" });
    }
  };

  const handleResend = async () => {
    try {
      setTimer(59);
      setShow(true);
      const email = localStorage.getItem("email");
      if(!email) return;
      await resendVerificationCodeSignup(email);

    } catch (error) {
      setErrors({ inputOtp: "Something went wrong. Please try again." });
      console.error("Error during OTP verification:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
     otp.forEach((element) => {
      if (!element.trim()) {
        newErrors.inputOtp = "Fields are empty";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <section className="bg-white  py-10  dark:bg-darkGray dark:border-darkGray">
      <div>
        <p className="mb-1.5 text-sm font-xs text-gray-400">
          Secure code{" "}
          {errors && <span className="text-red-500">{errors.inputOtp}</span>}
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
        Haven&apos;t received an OTP ?{" "}
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

export default Otp;
