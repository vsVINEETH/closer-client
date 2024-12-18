"use client";
import React, { useEffect, useState } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { login } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { AiFillGithub } from "react-icons/ai";
import useAxios from "@/hooks/useAxios/useAxios";
import { errorToast } from "@/utils/toasts/toats";

const Auth: React.FC = () => {
  const { data: session } = useSession();
  const [isRequestMade, setRequestMade] = useState(false);
  const { loading, handleRequest } = useAxios();
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (session && !isRequestMade) {
      const userData = {
        name: session.user?.name || "",
        email: session.user?.email || "",
      };
      localStorage.setItem("email", userData.email);
      setRequestMade(true);
      handleLog(userData);
      //  signOut({ redirect: false });
    } else {
      console.log("No user is logged in.");
    }
  }, [session]);

  const handleLog = async (userData: { name: string; email: string }) => {
    if (userData) {
      try {
        const response = await handleRequest({
          url: "/api/user/loginAuth",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: userData,
        });

        if (response.error) {
          errorToast(response.error);
        }

        if (response.data) {
          const { user } = response.data;
          console.log(user)
          if (user.setupCompleted && !user.isBlocked) {
            dispatch(
              login({
                id: user.id,
                username: user.username,
                email: user.email,
                image: user.image,
                phone: user.phone,
                birthday: user.dob,
                lookingFor: user.lookingFor,
                interestedIn: user.interestedIn,
                prime: user.prime
              })
            );
            router.push("/user/home");
          } else {
            router.push("/user/setup");
          }

          signOut({ redirect: false });
        } else {
          router.push("/user/login");
        }
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    }
  };

  return (
    <div className="border shadow-md rounded-md w-auto h-7 flex justify-center">
      <div className="cursor-pointer" onClick={() => signIn("google")}>
        <FcGoogle className="w-6 h-6" />
      </div>
      <span className="ml-2 text-darkGray dark:text-lightGray">
        {" "}
        Sign in with google
      </span>
      {/* <div className='cursor-pointer' onClick={() => signIn('github')}>
                <AiFillGithub className='bg-slate-50 w-6 h-6 dark:text-white dark:bg-darkGray' />
            </div> */}
    </div>
  );
};

export default Auth;
