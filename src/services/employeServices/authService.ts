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


const logout = async () => {
    return await handleRequest({
        url:'/api/employee/logout',
        method:'DELETE'
    });

};

return { login, logout, updatePassword }
}