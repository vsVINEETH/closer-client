"use client";
import { useCrudService } from "@/services/adminServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { EventData, SearchFilterSortParams } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";



export const useEventCrud = () => {
    const {postEvent, deleteEvent, updateEvent} = useCrudService();
    const {isLoading, setLoading} = useLoading()

    const createEvent = async (eventData: FormData, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await postEvent(eventData, searchFilterSortParams);

        if(response.error){
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const deleteExistingEvent = async (eventId: string, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await deleteEvent(eventId, searchFilterSortParams);

        if(response.error){
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const editEvent = async (updatedEventData: EventData | object, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await updateEvent(updatedEventData, searchFilterSortParams);

        if(response.error){
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    }

    return {isLoading, createEvent, deleteExistingEvent, editEvent};
}