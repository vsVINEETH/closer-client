'use client';
import { useState } from "react";
import { useCrudService } from "@/services/employeServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { CategoryCreateData, SearchFilterSortParams } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";


export const useCategoryCrud = () => {
    const {postCategory, listCategory, updateCategory} = useCrudService();
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const createCategory = async (categoryData: CategoryCreateData, searchFilterSortParams:SearchFilterSortParams) => {
        setLoading(true);
        const response = await postCategory(categoryData, searchFilterSortParams);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const controllCategoryListing = async (categoryId: string, searchFilterSortParams:SearchFilterSortParams) => {
        setLoading(true);
        const response = await listCategory(categoryId, searchFilterSortParams);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const editCategory = async (updatedCategoryData: any, searchFilterSortParams:SearchFilterSortParams) => {
        setLoading(true);
        const response = await updateCategory(updatedCategoryData,searchFilterSortParams );

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    }
    return {isLoading, createCategory, controllCategoryListing, editCategory, error};
}