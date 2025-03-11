"use client";
import { useState } from "react";
import { useFetchService } from "@/services/adminServices/fetchService";
import { SearchFilterSortParams, Filter } from "@/types/customTypes";
import { errorToast } from "@/utils/toasts/toast";
import { useLoading } from "@/context/LoadingContext";

export const useFetch = () => {
    const {fetchDashboardData, fetchAdvertisementData, fetchSubscriptionData, fetchEmployeeData, fetchUsersData, fetchEventData} = useFetchService();
   
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

    const getAdvertisementData = async (searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await fetchAdvertisementData(searchFilterSortParams);
        if(response.error){
          setError(response.error);
        }
        setLoading(false);
        return response;
    };

    const getSubscriptionData = async (searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await fetchSubscriptionData(searchFilterSortParams);
        if(response.error){
          setError(response.error);
          errorToast(response.error)
        }
        setLoading(false);
        return response;
    };

    const getEmployeeData = async (searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await fetchEmployeeData(searchFilterSortParams);
        if(response.error){
          setError(response.error);
          errorToast(response.error)
        }
        setLoading(false);
        return response;
    };

    const getUsersData = async (searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await fetchUsersData(searchFilterSortParams);
        if(response.error){
          setError(response.error);
          errorToast(response.error)
        }
        setLoading(false);
        return response;
    };

    const getEventData = async (searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await fetchEventData(searchFilterSortParams);
        if(response.error){
          setError(response.error);
          errorToast(response.error)
        }
        setLoading(false);
        return response;
    }

    return { getDashboardData, getAdvertisementData, getSubscriptionData, getEmployeeData, getUsersData, getEventData ,isLoading, error};
};