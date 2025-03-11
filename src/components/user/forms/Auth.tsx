"use client";
import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { SocialLogCredentialType } from "@/types/customTypes";
import { useAuth } from "@/hooks/authHooks/useUserAuth";
import { useTranslations } from "next-intl";

const Auth: React.FC = () => {
  const t = useTranslations('Login');
  const { data: session } = useSession();
  const [isRequestMade, setRequestMade] = useState(false)
  const {handleSocialLogin,} = useAuth()

  useEffect(() => {
    if (session && !isRequestMade) {
      const userSocialLogDetails = {
        name: session.user?.name || "",
        email: session.user?.email || "",
      };
      console.log(userSocialLogDetails)
      localStorage.setItem("email",userSocialLogDetails.email);
      setRequestMade(true);
      handleLog(userSocialLogDetails);
    } 

  }, [session]);

  const handleLog = async (userSocialLogDetails: SocialLogCredentialType) => {
    if (userSocialLogDetails) {
      try {
      await handleSocialLogin(userSocialLogDetails);

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
        {t('auth')}
        
      </span>
      {/* <div className='cursor-pointer' onClick={() => signIn('github')}>
                <AiFillGithub className='bg-slate-50 w-6 h-6 dark:text-white dark:bg-darkGray' />
            </div> */}
    </div>
  );
};

export default Auth;
