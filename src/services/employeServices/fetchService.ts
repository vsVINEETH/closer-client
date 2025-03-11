import useAxios from "@/hooks/axiosHooks/useAxios";
import { SearchFilterSortParams, Filter } from "@/types/customTypes";

export const useFetchService = () => {
    const {handleRequest} = useAxios();

    const fetchDashboardData = async (filterConstraints: Filter) => {
        return await handleRequest({
            url:'/api/employee/dashboard',
            method:'GET',
            params: filterConstraints
        })
    };

    const fetchContenData = async (searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/content_data',
            method:'GET', 
            params: searchFilterSortParams
        })
    }

    const fetchCategoryData = async (searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/category_data',
            method:'GET',
            params:searchFilterSortParams
        })
    }

    return {fetchDashboardData, fetchContenData, fetchCategoryData};
}