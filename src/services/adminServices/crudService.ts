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

    const listAdvertisement = async (advertisementId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/list_advertisement',
            method:'PATCH',
            data:{
                id: advertisementId
            },
            params: searchFilterSortParams
        })
    };

    const deleteAdvertisement = async (advertisementId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/advertisement',
            method:'DELETE',
            data:{
                id:advertisementId
            },
            params: searchFilterSortParams
        })
    };

    const updateAdvertisement = async (updatedAdvertisementData: AdvertisementData | object, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/advertisement',
            method:'PATCH',
            data: updatedAdvertisementData || {},
            params: searchFilterSortParams
        })
    };

    //Subscription
    const updateSubscription = async (updatedSubscriptionData: SubscriptionData, searchFilterSortParams: SearchFilterSortParams ) => {
        return await handleRequest({
            url:'/api/admin/update_subscription',
            method:'PATCH',
            data: updatedSubscriptionData,
            params: searchFilterSortParams
        })
    };

    const listSubscription = async (subscriptionId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/list_subscription',
            method:'POST',
            data:{
                id: subscriptionId
            },
            params: searchFilterSortParams
        })
    }


    //Employees
    const postEmployee = async (employeeData: EmployeeCreateData, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/create_employee',
            method:'POST',
            data: employeeData,
            params: searchFilterSortParams
        })
    };

    const listEmployee = async (employeeId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/block_employee',
            method:'POST',
            data:{
                id: employeeId
            },
            params: searchFilterSortParams
        })
    };

    
    //Users
    const listUser = async (userId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/block_user',
            method:'POST',
            data:{
                id:userId
            },
            params: searchFilterSortParams
        })
    };

    const restrictUser = async (userId: string, duration: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/ban_user',
            method:'PATCH',
            data:{
                id:userId,
                duration: duration
            },
            params: searchFilterSortParams
        })
    };

    const removeUserRestriction  = async (userId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/unban_user',
            method:'PATCH',
            data:{
                id:userId,
            },
            params: searchFilterSortParams
        })
    };


    //Events
    const postEvent = async (eventData: FormData, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url: '/api/admin/events',
            method:'POST',
            data: eventData,
            headers:{
                'Content-Type': 'multipart/form-data', 
            },
            params: searchFilterSortParams
        })
    };

    const deleteEvent = async (eventId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/events',
            method:'DELETE',
            data:{
                id:eventId
            },
            params: searchFilterSortParams
        })
    };

    const updateEvent = async (updatedEventData: EventData | object, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/events',
            method:'PATCH',
            data: updatedEventData || {},
            params: searchFilterSortParams
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