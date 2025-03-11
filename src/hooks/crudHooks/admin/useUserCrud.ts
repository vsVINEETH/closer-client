"use client";
import { useState } from "react";
import { useCrudService } from "@/services/adminServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { useLoading } from "@/context/LoadingContext";


export const useUserCrud = () => {
    const {listUser, restrictUser, removeUserRestriction} = useCrudService();
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const blockUser = async (userId: string) => {
        setLoading(true);
        const response = await listUser(userId);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const banUser = async (userId: string, duration: string) => {
        setLoading(true);
        const response = await restrictUser(userId, duration);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const unbanUser = async (userId: string) => {
        setLoading(true);
        const response = await removeUserRestriction(userId);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    }


    return {isLoading,blockUser, banUser, unbanUser, error}
}