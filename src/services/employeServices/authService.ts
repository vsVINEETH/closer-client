import useAxios from "@/hooks/axiosHooks/useAxios";
import { LoginCrendentialsType, ChangePasswordData } from "@/types/customTypes";

export const useAuthService = () => {
const {handleRequest} = useAxios();

const login = async (loginCredentials: LoginCrendentialsType) => {
      return await handleRequest({
         url:'/api/employee/login',
         method:'POST',
         data: loginCredentials
      });
}

const updatePassword = async (employeeId: string, updatedPasswordData: ChangePasswordData) => {
    return await handleRequest({
        url: '/api/employee/change_password',
        method: 'POST',
        data: {
          id: employeeId,
          formData: updatedPasswordData
        }
    })
};

const verifyOTP = async (employeeEmail: string, OTP: string[]) => {
    return await handleRequest({
        url: '/api/employee/verify',
        method: 'POST',
        data: {
          email: employeeEmail,
          otp: OTP
        }  
    })
};

const resendOTP = async (employeeEmail: string) => {
    return await handleRequest({
        url: '/api/employee/resend',
        method: 'POST',
        data: {
          email: employeeEmail
        }
    })
};

const logout = async () => {
    return await handleRequest({
        url:'/api/employee/logout',
        method:'DELETE'
    });

};

return { login, logout, resendOTP, verifyOTP, updatePassword }
}