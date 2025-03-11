import useAxios from "@/hooks/axiosHooks/useAxios";
import { SearchFilterSortParams, PreferenceData } from "@/types/customTypes";

export const useFetchService = () => {
    const {handleRequest} = useAxios();

    const fetchUsersData = async (userPreferences: PreferenceData) => {
        return await handleRequest({
            url: "/api/user/users_data",
            method: "GET",
            params: userPreferences
        });
    };

    const fetchAdvertisementData = async () => {
        return await handleRequest({
            url: "/api/user/advertisements",
            method: "GET", 
        })
    };


    const fetchBlogData = async (searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url: '/api/employee/content_data',
            method: 'GET', 
            params: searchFilterSortParams 
        })
    };


    const fetchBlogDetails = async (blogId: string) => {
        return await handleRequest({
            url: '/api/user/content_detail',
            method: 'GET',
            params: {
                id: blogId
            }
        })
    };

    const fetchWalletData = async (userId: string) => {
        return await handleRequest({
            url: '/api/user/wallet',
            method: 'GET',
            params: { id: userId },  
        })
    };

    const fetchBlockedUserData = async (userId: string) => {
        return await handleRequest({
            url: '/api/user/block_list',
            method: 'GET',
            params: {
              id: userId,
            }, 
        })
    };

    const fetchBookedEventData = async (userId: string) => {
        return await handleRequest({
            url: '/api/user/booked_events',
            method: 'GET',
            params: {
              userId: userId,
            },
        })
    };

    const fetchProfileDetails = async (userId: string) => {
        return await handleRequest({
            url:'/api/user/profile',
            method:'GET',
            data:{
              id: userId
            },
            params:{
                  id: userId
              }
        })
    };

    const updateProfile = async (userId: string, filed: string, value: string ) => {
        return await handleRequest({
            url:'/api/user/update_profile',
            method:'PATCH',
            data:{
              field: filed,
              value: value
            },
            params:{
              id: userId
            }
        })
    };

    const deleteProfileImage = async (userId: string, imageURLSource: string) => {
        return await handleRequest({
            url:'/api/user/profile_image',
            method:'DELETE',
            data:{
              id: userId,
              src: imageURLSource
            }  
        })
    };

    const addProfileImage = async (userId: string, imageData: FormData) => {
        return await handleRequest({
            url:'/api/user/profile_image',
            method:'PATCH',
            data: imageData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            params:{
              id:userId
            } 
        })
    };


    const fetchNotifications = async (userId: string) => {
        return await handleRequest({
            url: "/api/user/notifications",
            method: "GET",
            params: {
              id: userId,
            }
        })
    };

    const fetchMessages = async (userId: string) => {
        return await handleRequest({
            url: "/api/user/messages",
            method: "GET",
            params: {
              id: userId,
            }
        })
    };


    const fetchMatches = async (userId: string) => {
        return await handleRequest({
            url: "/api/user/matches",
            method: "GET",
            params: {
              id: userId,
            }
        })
    };

    const showInterestOnUser = async (notificationId: string, userId: string, interactorId: string, status: boolean) => {
        return await handleRequest({
            url: "/api/user/interest_request",
            method: "POST",
            data: {
              id: notificationId,
              userId: userId,
              interactorId: interactorId,
              status: status,
            }
        })
    };

    const unmatchUserFromList = async (userId: string, interactorId: string) => {
        return await handleRequest({
            url:"/api/user/unmatch",
            method:'PATCH',
            data:{
              userId: userId,
              interactorId: interactorId,
            }
        })
    };

    const fetchSubscriptionData = async () => {
        return await handleRequest({
            url: '/api/user/subscription',
            method: 'GET', 
        })
    };

    const fetchSubscriptionPlanData = async (planId: string) => {
        return await handleRequest({
            url:'/api/user/selected_subscription',
            method:'GET',
            params:{
                planId
            } 
        })
    };

    const fetchEventData = async (eventId: string) => {
        return await handleRequest({
            url: '/api/user/event',
            method: 'GET',
            params: { id: eventId }
        })
    };

    const fetchChat = async (senderId: string, receiverId: string) => {
        return await handleRequest({
            url: '/api/user/chats',
            method: 'GET',
            params: {
              sender: senderId,
              receiver: receiverId,
            },
        })
    };

    const postAudio = async (audioData: FormData) => {
        return await handleRequest({
            url: '/api/user/upload_audio',
            method: 'POST',
            data: audioData,
        })
    };


 
    return {fetchUsersData, fetchAdvertisementData,
            fetchBlogData, fetchBlogDetails,
            fetchBlockedUserData, fetchBookedEventData,
            fetchProfileDetails, updateProfile, deleteProfileImage,
            addProfileImage, fetchNotifications, fetchMessages,
            fetchMatches, showInterestOnUser, unmatchUserFromList,
            fetchSubscriptionData, fetchSubscriptionPlanData, fetchEventData,
            fetchChat, postAudio, fetchWalletData
        };
}