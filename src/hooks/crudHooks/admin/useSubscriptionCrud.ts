"use client";
import { useState } from "react";
import { useCrudService } from "@/services/adminServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { SubscriptionData } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";


export const useSubscriptionCrud = () => {
    const {updateSubscription, listSubscription} = useCrudService();
    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const editSubscription = async (updatedSubscriptionData: SubscriptionData) => {
        setLoading(true);
        const response = await updateSubscription(updatedSubscriptionData);

        if(response.error){
         setError(response.error)
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    }

    const controllSubscriptionListing = async (subscriptionId: string) => {
        setLoading(true);
        const response = await listSubscription(subscriptionId);

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