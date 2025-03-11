"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurityService } from "@/services/userServices/securityService";
import { ChangePasswordData, PreferenceData } from "@/types/customTypes";
import { errorToast, warnToast } from "@/utils/toasts/toast";
import { useLoading } from "@/context/LoadingContext";

export const useSecurity = () => {
    const  {restrictUser, allowUserToIntract ,reportUser, verifyOTP, resendOTP,
            updatePassword, verifyOTPSignup, resendOTPSignup
    } = useSecurityService();
    
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
   
    const blockUser = async (userIdToBlock: string, userId: string, userPreferences: PreferenceData) => {
        setLoading(true);
        const response = await restrictUser(userIdToBlock, userId, userPreferences);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        router.push('/user/blocked')
        setLoading(false);
        return response;
    };

    const unblockUser = async (userIdToUnblock: string, userId: string) => {
        setLoading(true);
        const response = await allowUserToIntract(userIdToUnblock, userId);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response;
    }

    const markReportUser = async (userIdToBlock: string, userId: string, userPreferences: PreferenceData) => {
        setLoading(true);
        const response = await reportUser(userIdToBlock, userId, userPreferences);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response; 
    };

    const validateOTP = async (userEmail: string, OTP: string[]) => {
        setLoading(true);
        const response = await verifyOTP(userEmail, OTP);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response; 
    };

    const resendVerificationCode = async (userEmail: string) => {
        setLoading(true);
        const response = await resendOTP(userEmail);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response; 
    };

    const changePassword = async (userId: string, updatedPasswordData: ChangePasswordData) => {
        setLoading(true);
        const response = await updatePassword(userId, updatedPasswordData);
        if(response.error){
            setError(response.error)
            warnToast(response.error);
        }
        setLoading(false);
        return response; 
    };

    const validateOTPSignup = async (userEmail: string, OTP: string[]) => {
        setLoading(true);
        const response = await verifyOTPSignup(userEmail, OTP);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response; 
    };

    const resendVerificationCodeSignup = async (userEmail: string) => {
        setLoading(true);
        const response = await resendOTPSignup(userEmail);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response;
    };




    return {isLoading, error,blockUser, unblockUser, markReportUser,
           validateOTP, resendVerificationCode, changePassword,
           validateOTPSignup, resendVerificationCodeSignup,

    }
}