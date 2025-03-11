"use client";
import { useState } from "react";
import { useFetchService } from "@/services/employeServices/fetchService";
import { SearchFilterSortParams, Filter } from "@/types/customTypes";

import { useLoading } from "@/context/LoadingContext";
export const useFetch = () => {
    const {fetchDashboardData, fetchContenData, fetchCategoryData} = useFetchService();

    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);


    const getDashboardData = async (filterConstraints: Filter) => {
        setLoading(true);
        const response = await fetchDashboardData(filterConstraints);
        if(response.error){
         setError(response.error)
        }
        setLoading(false);
        return response;
    };


    const getContentData = async (searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await fetchContenData(searchFilterSortParams);
        if(response.error){
         setError(response.error)
        }
        setLoading(false);
        return response;
    }

    const getCategoryData = async (searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
       
        const response = await fetchCategoryData(searchFilterSortParams);
        if(response.error){
         setError(response.error)
        }
        setLoading(false);
        return response;
    }

    return {isLoading, error, getDashboardData, getContentData, getCategoryData};

}