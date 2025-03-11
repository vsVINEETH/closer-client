'use client';
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthService } from "@/services/userServices/authService";
import { signOut } from "next-auth/react";
import { logout as userLogout, login as userLogin } from "@/store/slices/userSlice";
import { useRouter } from "next/navigation";
import { LoginCrendentialsType, SocialLogCredentialType } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";

export const useAuth = () => {
    const {login, socialLogin, logout} = useAuthService();
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
            const { user } = response.data;
            if (user.setupCompleted && !user.isBlocked) {
            dispatch(
            userLogin({
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
        }
        setLoading(false);
        return response;
    };

    const handleSocialLogin = async (userSocialLogDetails: SocialLogCredentialType) => {
        setLoading(true);
        const response = await socialLogin(userSocialLogDetails);
        if(response.error){
            setError(response.error);
        }
        if (response.data) {
            const { user } = response.data;
            if (user.setupCompleted && !user.isBlocked) {
            dispatch(
                userLogin({
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
            return response
        } else {
            router.push("/user/login");
        }
        setLoading(false)
        return response

    }
    
    const handleLogout = async () => {
        setLoading(true);
        await logout();
        dispatch(userLogout());
        router.push("/user/login");
        setLoading(false);
    };

    return {handleLogin, handleLogout,handleSocialLogin, isLoading, error};
}