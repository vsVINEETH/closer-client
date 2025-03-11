import useAxios from "@/hooks/axiosHooks/useAxios";
import { ChangePasswordData, PreferenceData } from "@/types/customTypes";

export const useSecurityService = () => {
    const {handleRequest} = useAxios();

    const restrictUser = async (userIdToBlock: string, userId: string, userPreferences: PreferenceData) => {
        return await handleRequest({
            url: "/api/user/block",
            method: "PUT",
            data:{
                blockedId: userIdToBlock,
                userId: userId,
                userPreferences: userPreferences
            }
        })
    };

    const allowUserToIntract = async (userIdToUnblock: string, userId: string) => {
        return await handleRequest({
            url:'/api/user/unblock',
            method:'PUT',
            data:{
                unblockId: userIdToUnblock,
                id: userId
            }
        })
    }

    const reportUser = async (userIdToReport: string, userId: string, userPreferences: PreferenceData) => {
        return await handleRequest({
            url: "/api/user/report",
            method: "PUT",
            data: {
                reportedId: userIdToReport,
                userId: userId,
                userPreferences: userPreferences  
            }  
        })
    };

    const verifyOTP = async (userEmail: string, OTP: string[]) => {
        return await handleRequest({
            url:'/api/user/forgot_verify',
            method: 'POST',
            data:{
              email: userEmail,
              otp: OTP
            }
        })
    };

    const resendOTP = async (userEmail: string) => {
        return await handleRequest({
            url: '/api/user/forgot_resend',
            method:'POST',
            data:{
                email: userEmail
            } 
        })
    };

    const updatePassword = async (userId: string, updatedPasswordData: ChangePasswordData ) => {
        return await handleRequest({
            url: "/api/user/change_password",
            method: "POST",
            data: {
              id: userId,
              formData: updatedPasswordData,
            } 
        })
    };


    const verifyOTPSignup = async (userEmail: string, OTP: string[]) => {
        return await handleRequest({
            url:'/api/user/verify',
            method: 'POST',
            data:{
              email: userEmail,
              otp: OTP,
            }
        })
    };

    const resendOTPSignup = async (userEmail: string) => {
        return await handleRequest({
            url: '/api/user/resend',
            method:'POST',
            data:{
                email: userEmail,
            }
        })
    }



    return {restrictUser,allowUserToIntract ,reportUser, verifyOTP, resendOTP, updatePassword, verifyOTPSignup, resendOTPSignup}
} 