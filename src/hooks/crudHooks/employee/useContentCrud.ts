'use client';
import { useState } from "react";
import { useCrudService } from "@/services/employeServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { useLoading } from "@/context/LoadingContext";
import { SearchFilterSortParams } from "@/types/customTypes";

export const useContentCrud = () => {
    const {postContent, listContent, deleteContent, updateContent}  = useCrudService()
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const createContent = async (contentData: FormData, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await postContent(contentData, searchFilterSortParams);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const controllContentListing = async (contentId: string, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await listContent(contentId, searchFilterSortParams);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };


    const deleteExistingContent = async (contentId: string, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await deleteContent(contentId, searchFilterSortParams);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const editContent = async (updatedContentData: any | object, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await updateContent(updatedContentData, searchFilterSortParams);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    }

    return {isLoading, error, createContent, controllContentListing, deleteExistingContent, editContent};
}