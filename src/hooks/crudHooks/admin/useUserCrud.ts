"use client";
import { useState } from "react";
import { useCrudService } from "@/services/adminServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { useLoading } from "@/context/LoadingContext";
import { SearchFilterSortParams } from "@/types/customTypes";

export const useUserCrud = () => {
    const {listUser, restrictUser, removeUserRestriction} = useCrudService();
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const blockUser = async (userId: string, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await listUser(userId, searchFilterSortParams);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const banUser = async (userId: string, duration: string, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await restrictUser(userId, duration, searchFilterSortParams);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const unbanUser = async (userId: string, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await removeUserRestriction(userId, searchFilterSortParams);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    }


    return {isLoading,blockUser, banUser, unbanUser, error}
}