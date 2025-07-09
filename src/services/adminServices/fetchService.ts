import useAxios from "@/hooks/axiosHooks/useAxios";
import { SearchFilterSortParams, Filter } from "@/types/customTypes";

export const useFetchService = () => {
    const {handleRequest} = useAxios();

    const fetchDashboardData = async (filterConstraints: Filter) => {
        return await handleRequest({
            url:'/api/admin/dashboard',
            method:'GET',
            params: filterConstraints
        })
    };

    const fetchAdvertisementData = async (searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/advertisements',
            method:'GET',
            params: searchFilterSortParams
        })
    };

    const fetchSubscriptionData = async (searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/subscriptions',
            method:'GET',
            params: searchFilterSortParams,
        })
    };

    const fetchEmployeeData = async (searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/employees',
            method:'GET',
            params: searchFilterSortParams
        })
    };

    const fetchUsersData = async (searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/users',
            method:'GET',
            params: searchFilterSortParams
        })
    };

    const fetchEventData = async (searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/admin/events',
            method:'GET',
            params: searchFilterSortParams
        })
    }

    return { fetchDashboardData,
             fetchAdvertisementData, 
             fetchSubscriptionData, 
             fetchEmployeeData, 
             fetchUsersData,
             fetchEventData,
            }
}