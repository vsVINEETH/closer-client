"use client";
import { useState } from "react";
import { useFetchService } from "@/services/userServices/fetchService";
import { SearchFilterSortParams, PreferenceData } from "@/types/customTypes";
import { errorToast } from "@/utils/toasts/toast";
import { useLoading } from "@/context/LoadingContext";

export const useFetch = () => {
    const {fetchUsersData, fetchAdvertisementData,
            fetchBlogData, fetchBlogDetails,
            fetchBlockedUserData, fetchBookedEventData,
            fetchProfileDetails,updateProfile, addProfileImage,
            deleteProfileImage,fetchNotifications, fetchMatches,
            fetchMessages, showInterestOnUser,unmatchUserFromList,
            fetchSubscriptionData,fetchSubscriptionPlanData,fetchEventData,
            fetchChat, postAudio, fetchWalletData
            
        } = useFetchService();

    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);

    const getUsersData = async (userPreferences: PreferenceData) => {
        setLoading(true);
        const response = await fetchUsersData(userPreferences);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getAdvertisementData = async () => {
        setLoading(true);
        const response = await fetchAdvertisementData();
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getBlogData = async (searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await fetchBlogData(searchFilterSortParams);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getBlogDetails = async (blogId: string) => {
        setLoading(true);
        const response = await fetchBlogDetails(blogId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };
    
    const getBlockedUsersList = async (userId: string) => {
        setLoading(true);
        const response = await fetchBlockedUserData(userId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getBookedEventsData = async (userId: string) => {
        setLoading(true);
        const response = await fetchBookedEventData(userId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    }

    const getProfileDetails = async (userId: string) => {
        setLoading(true);
        const response = await fetchProfileDetails(userId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const editProfile = async (userId: string, filed: string, value: string ) => {
        setLoading(true);
        const response = await updateProfile(userId, filed, value);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const deleteProfilePicture = async (userId: string, imageURLSource: string) => {
        setLoading(true);
        const response = await deleteProfileImage(userId, imageURLSource);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const updateProfilePicture = async (userId: string, imageData: FormData) => {
        setLoading(true);
        const response = await addProfileImage(userId, imageData);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getNotifications = async (userId: string) => {
        setLoading(true);
        const response = await fetchNotifications(userId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    }
    const getMessages = async (userId: string) => {
        setLoading(true);
        const response = await fetchMessages(userId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };
    
    const getMatches = async (userId: string) => {
        setLoading(true);
        const response = await fetchMatches(userId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const interestOnUser = async (notificationId: string, userId: string, interactorId: string, status: boolean) => {
        setLoading(true);
        const response = await showInterestOnUser(notificationId, userId, interactorId, status);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response; 
    };

    const unmatchUser = async (userId: string, interactorId: string) => {
        setLoading(true);
        const response = await unmatchUserFromList(userId, interactorId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getSubscriptionData = async () => {
        setLoading(true);
        const response = await fetchSubscriptionData();
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getSubscriptionPlanData = async (plandId: string) => {
        setLoading(true);
        const response = await fetchSubscriptionPlanData(plandId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getEventData = async (eventId: string) => {
        setLoading(true);
        const response = await fetchEventData(eventId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getChats = async (senerId: string, receiverId: string) => {
        setLoading(true);
        const response = await fetchChat(senerId, receiverId);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const sendAudio = async (audioData: FormData) => {
        setLoading(true);
        const response = await postAudio(audioData);
        if(response.error){
         setError(response.error)
         errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const getWalletData = async (userId: string) => {
        setLoading(true);
        const response = await fetchWalletData(userId);
        if(response.error){
         setError(response.error)
         //errorToast(response.error);
        }
        setLoading(false);
        return response; 
    }

    return {isLoading, error, getUsersData, getAdvertisementData,
           getBlogData, getBlogDetails,
           getBlockedUsersList, getBookedEventsData,
           getProfileDetails, editProfile, deleteProfilePicture,
           updateProfilePicture, getNotifications, getMessages,
           getMatches,interestOnUser, unmatchUser, getSubscriptionData,
           getSubscriptionPlanData, getEventData, getChats, sendAudio, 
           getWalletData
        }
}