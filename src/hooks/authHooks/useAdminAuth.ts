"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthService } from "@/services/adminServices/authService";
import { logout as adminLogout, login as adminLogin } from "@/store/slices/adminSlice";
import { useRouter } from "next/navigation";
import { LoginCrendentialsType } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";

export const useAuth = () => {
  const { login, logout } = useAuthService();
  const {isLoading, setLoading} = useLoading()
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async (loginCredentials: LoginCrendentialsType) => {
    setLoading(true);
    const result = await login(loginCredentials);
    if (result.error) {
      setError(result.error);
      return;
    }else{
      
    }
    setLoading(false);
    const admin = result.data.admin
    dispatch(
      adminLogin(
        {id: admin.id, email: admin.email}
      )
    );
    router.push('/admin/dashboard');
    return result;
  };

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    dispatch(adminLogout());
    router.push("/admin/login");
    setLoading(false);
  };

  return { handleLogin, handleLogout, isLoading, error };
};
