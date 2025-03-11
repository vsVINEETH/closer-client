"use client";
import { useCrudService } from "@/services/adminServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { EventData } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";



export const useEventCrud = () => {
    const {postEvent, deleteEvent, updateEvent} = useCrudService();
    const {isLoading, setLoading} = useLoading()

    const createEvent = async (eventData: FormData) => {
        setLoading(true);
        const response = await postEvent(eventData);

        if(response.error){
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const deleteExistingEvent = async (eventId: string) => {
        setLoading(true);
        const response = await deleteEvent(eventId);

        if(response.error){
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const editEvent = async (updatedEventData: EventData | object) => {
        setLoading(true);
        const response = await updateEvent(updatedEventData);

        if(response.error){
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    }

    return {isLoading, createEvent, deleteExistingEvent, editEvent};
}