"use client";
import { useState } from "react";
import { useCrudService } from "@/services/adminServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { AdvertisementData, SearchFilterSortParams } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";


export const useAdvertisementCrud = () => {
    const {postAdvertisement, listAdvertisement, deleteAdvertisement, updateAdvertisement,} = useCrudService();
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const createAd = async (advertisementData: FormData, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await postAdvertisement(advertisementData, searchFilterSortParams);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const controllAdListing = async (advertisementId: string) => {
        setLoading(true);
        const response = await listAdvertisement(advertisementId);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const deleteAd = async (advertisementId: string) => {
        setLoading(true);
        const response = await deleteAdvertisement(advertisementId);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const editAd = async (updateAdvertisementData: AdvertisementData | object) => {
        setLoading(true);
        const response = await updateAdvertisement(updateAdvertisementData);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    return { createAd, controllAdListing, deleteAd, editAd, isLoading, error}
}