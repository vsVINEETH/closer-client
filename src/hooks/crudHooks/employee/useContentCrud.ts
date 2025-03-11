'use client';
import { useState } from "react";
import { useCrudService } from "@/services/employeServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { useLoading } from "@/context/LoadingContext";

export const useContentCrud = () => {
    const {postContent, listContent, deleteContent, updateContent}  = useCrudService()
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const createContent = async (contentData: FormData) => {
        setLoading(true);
        const response = await postContent(contentData);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const controllContentListing = async (contentId: string) => {
        setLoading(true);
        const response = await listContent(contentId);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };


    const deleteExistingContent = async (contentId: string) => {
        setLoading(true);
        const response = await deleteContent(contentId);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const editContent = async (updatedContentData: any | object) => {
        setLoading(true);
        const response = await updateContent(updatedContentData);

        if(response.error){
            setError(response.error)
            errorToast(response.error)
        }

        setLoading(false);
        return response;
    }

    return {isLoading, error, createContent, controllContentListing, deleteExistingContent, editContent};
}