'use client';
import { useState } from "react";
import { useCrudService } from "@/services/employeServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { CategoryCreateData } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";


export const useCategoryCrud = () => {
    const {postCategory, listCategory, updateCategory} = useCrudService();
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const createCategory = async (categoryData: CategoryCreateData) => {
        setLoading(true);
        const response = await postCategory(categoryData);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const controllCategoryListing = async (categoryId: string) => {
        setLoading(true);
        const response = await listCategory(categoryId);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const editCategory = async (updatedCategoryData: any) => {
        setLoading(true);
        const response = await updateCategory(updatedCategoryData);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    }
    return {isLoading, createCategory, controllCategoryListing, editCategory, error};
}