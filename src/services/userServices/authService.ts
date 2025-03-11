import useAxios from "@/hooks/axiosHooks/useAxios";
import { LoginCrendentialsType, SocialLogCredentialType } from "@/types/customTypes";

export const useAuthService = () => {

const {handleRequest} = useAxios();

const login = async (loginCredentials: LoginCrendentialsType) => {
      return await handleRequest({
         url:'/api/user/login',
         method:'POST',
         data: loginCredentials
      });
}

const socialLogin = async (userSocialLogDetails: SocialLogCredentialType) => {
    return await handleRequest({
        url: "/api/user/loginAuth",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: userSocialLogDetails,
    })
}

const logout = async () => {
    return await handleRequest({
        url:'/api/user/logout',
        method:'DELETE'
    });

}

return { login, socialLogin, logout }
}