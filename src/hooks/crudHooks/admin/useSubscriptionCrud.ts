"use client";
import { useState } from "react";
import { useCrudService } from "@/services/adminServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { SubscriptionData, SearchFilterSortParams } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";


export const useSubscriptionCrud = () => {
    const {updateSubscription, listSubscription} = useCrudService();
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const editSubscription = async (updatedSubscriptionData: SubscriptionData, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await updateSubscription(updatedSubscriptionData, searchFilterSortParams);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    }

    const controllSubscriptionListing = async (subscriptionId: string, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await listSubscription(subscriptionId, searchFilterSortParams);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    }


    return {isLoading, editSubscription,
            controllSubscriptionListing,
            error
            
    }
}