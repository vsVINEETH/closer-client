import useAxios from "@/hooks/axiosHooks/useAxios";
import { LoginCrendentialsType } from "@/types/customTypes";

export const useAuthService = () => {

const {handleRequest} = useAxios();

const login = async (loginCredentials: LoginCrendentialsType) => {
      return await handleRequest({
         url:'/api/admin/login',
         method:'POST',
         data: loginCredentials
      });
};

const logout = async () => {
    return await handleRequest({
        url:'/api/admin/logout',
        method:'DELETE'
    });
};

return { login, logout }
}