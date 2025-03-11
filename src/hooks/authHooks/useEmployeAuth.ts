'use client';
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthService } from "@/services/employeServices/authService";
import {logout as employeeLogout, login as employeeLogin} from '@/store/slices/employeeSlice';
import { useRouter } from "next/navigation";
import { LoginCrendentialsType, ChangePasswordData } from "@/types/customTypes";
import { errorToast } from "@/utils/toasts/toast";
import { useLoading } from "@/context/LoadingContext";

export const useAuth = () => {
    const {login,updatePassword,verifyOTP, resendOTP, logout} = useAuthService();
    
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogin = async (loginCredentials: LoginCrendentialsType) => {
        setLoading(true);
        const response = await login(loginCredentials);
        if (response.error) {
          setError(response.error);
        }
        if(response.data){
            const employee = response.data.employee;
            dispatch(
              employeeLogin(
                {id: employee.id,
                 empname: employee.name, 
                 email: employee.email
                }
              )
            )
            router.push('/employee/dashboard');
          }
        setLoading(false);
        return response;
      };

    const changePassword = async (employeeId: string, updatedPasswordData: ChangePasswordData ) => {
      setLoading(true);
      const response = await updatePassword(employeeId, updatedPasswordData);
      if(response.error){
       setError(response.error);
       errorToast(response.error);
      }
      setLoading(false);
      return response;
    };

    const validateOTP = async (employeeEmail: string, OTP: string[]) => {
      setLoading(true);
      const response = await verifyOTP(employeeEmail, OTP);
      if(response.error){
       setError(response.error);
       errorToast(response.error);
      }
      setLoading(false);
      return response;
    };

    const resendVerificationCode = async (employeeEmail: string) => {
      setLoading(true);
      const response = await resendOTP(employeeEmail);
      if(response.error){
       setError(response.error);
       errorToast(response.error);
      }
      setLoading(false);
      return response;
    }
    
    const handleLogout = async () => {
        setLoading(true);
        await logout();
        dispatch(employeeLogout());
        router.push("/employee/login");
        setLoading(false);
    };

    return {handleLogin, handleLogout, changePassword, validateOTP, resendVerificationCode, isLoading, error};
} 