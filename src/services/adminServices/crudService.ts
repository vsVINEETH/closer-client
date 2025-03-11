import useAxios from "@/hooks/axiosHooks/useAxios";
import { AdvertisementData, SubscriptionData, EmployeeCreateData, SearchFilterSortParams } from "@/types/customTypes";
import { EventData } from "@/types/customTypes";
export const useCrudService = () => {
    const {handleRequest} = useAxios();

    // Advertisement
    const postAdvertisement = async (advertisementData: FormData, searchFilterSortParams: SearchFilterSortParams ) => {
        return await handleRequest({
            url: '/api/admin/advertisement',
            method:'POST',
            data: advertisementData,
            params:searchFilterSortParams,
            headers:{
                'Content-Type': 'multipart/form-data', 
            }
        })
    }

    const listAdvertisement = async (advertisementId: string) => {
        return await handleRequest({
            url:'/api/admin/list_advertisement',
            method:'PATCH',
            data:{
                id: advertisementId
            }
        })
    };

    const deleteAdvertisement = async (advertisementId: string) => {
        return await handleRequest({
            url:'/api/admin/advertisement',
            method:'DELETE',
            data:{
                id:advertisementId
            }
        })
    };

    const updateAdvertisement = async (updatedAdvertisementData: AdvertisementData | object) => {
        return await handleRequest({
            url:'/api/admin/advertisement',
            method:'PATCH',
            data: updatedAdvertisementData || {},
        })
    };

    //Subscription
    const updateSubscription = async (updatedSubscriptionData: SubscriptionData) => {
        return await handleRequest({
            url:'/api/admin/update_subscription',
            method:'PATCH',
            data: updatedSubscriptionData,
        })
    };

    const listSubscription = async (subscriptionId: string) => {
        return await handleRequest({
            url:'/api/admin/list_subscription',
            method:'POST',
            data:{
                id: subscriptionId
            }
        })
    }


    //Employees
    const postEmployee = async (employeeData: EmployeeCreateData) => {
        return await handleRequest({
            url:'/api/admin/create_employee',
            method:'POST',
            data: employeeData 
        })
    };

    const listEmployee = async (employeeId: string) => {
        return await handleRequest({
            url:'/api/admin/block_employee',
            method:'POST',
            data:{
                id: employeeId
            }
        })
    };

    
    //Users
    const listUser = async (userId: string) => {
        return await handleRequest({
            url:'/api/admin/block_user',
            method:'POST',
            data:{
                id:userId
            }
        })
    };

    const restrictUser = async (userId: string, duration: string) => {
        return await handleRequest({
            url:'/api/admin/ban_user',
            method:'PATCH',
            data:{
                id:userId,
                duration: duration
            }
        })
    };

    const removeUserRestriction  = async (userId: string) => {
        return await handleRequest({
            url:'/api/admin/unban_user',
            method:'PATCH',
            data:{
                id:userId,
            }
        })
    };


    //Events
    const postEvent = async (eventData: FormData) => {
        return await handleRequest({
            url: '/api/admin/events',
            method:'POST',
            data: eventData,
            headers:{
                'Content-Type': 'multipart/form-data', 
            }
        })
    };

    const deleteEvent = async (eventId: string) => {
        return await handleRequest({
            url:'/api/admin/events',
            method:'DELETE',
            data:{
                id:eventId
            }
        })
    };

    const updateEvent = async (updatedEventData: EventData | object) => {
        return await handleRequest({
            url:'/api/admin/events',
            method:'PATCH',
            data: updatedEventData || {},
        })
    }

    return {
            postAdvertisement,
            listAdvertisement,
            deleteAdvertisement,
            updateAdvertisement,

            updateSubscription,
            listSubscription,

            postEmployee,
            listEmployee,

            listUser,
            restrictUser,
            removeUserRestriction,

            postEvent,
            deleteEvent,
            updateEvent,
        };
}