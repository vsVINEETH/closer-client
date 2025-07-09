import useAxios from "@/hooks/axiosHooks/useAxios";
import {SubscriptionPaymentWalletData, SubscriptionPaymentData,
    RazorpaySubscriptionPaymentData, EventBookingData,EventPaymentData, RazorpayEventPaymentData, RazorpayWalletPaymentData
 } from "@/types/customTypes";

export const useUserInteractionService = () => {
    const {handleRequest} = useAxios();

    const controllBlogVoting = async (userId: string, blogId: string, voteType: string) => {
        return await handleRequest({
            url: '/api/user/contents/vote',
            method: 'PATCH',
            data: {
                id: userId,
                blogId,
                voteType,
            }
        })
    };

    const controllBlogSharing = async (userId: string, blogId: string) => {
        return await handleRequest({
            url: '/api/user/contents/share',
            method: 'PATCH',
            data: {
                id: userId,
                blogId
            }
        })
    };

    const completeAccountSetup = async (accountSetupDetails: FormData) => {
        return await handleRequest({
            url:'/api/user/setup',
            method:'POST',
            data: accountSetupDetails,
            headers: {
              'Content-Type': 'multipart/form-data',
            } 
        })
    };

    //payment
    const walletSubscriptionPayment = async (subscriptionPaymentData: SubscriptionPaymentWalletData) => {
        return await handleRequest({
            url:'/api/user/wallet/pay',
            method:'POST',
            data:subscriptionPaymentData
        })
    };

    const createOrderSubscriptionPayment = async (subscriptionPaymentData: SubscriptionPaymentData) => {
        return await handleRequest({
            url:'/api/user/subscriptions/order',
            method:'POST',
            data:subscriptionPaymentData
        })
    };

    const verifySubscriptionPayment = async (razorpaySubscriptionPaymentData: RazorpaySubscriptionPaymentData) => {
        return await handleRequest({
            url:'/api/user/subscriptions/verify',
            method:'POST',
            data: razorpaySubscriptionPaymentData
        })
    };

    const abortSubscriptionPayment = async (userId: string) => {
        return await handleRequest({
            url:'/api/user/subscriptions/abort',
            method:'PUT',
            data:{
              userId: userId
            } 
        })
    };


    const walletEventPayment = async (eventBookingData: EventBookingData) => {
        return await handleRequest({
            url: '/api/user/wallet/pay',
            method: 'POST',
            data: eventBookingData
        })
    };

    const createOrderEventPayment = async (eventPaymentData: EventPaymentData) => {
        return await handleRequest({
            url: '/api/user/events/book-order',
            method: 'POST',
            data: eventPaymentData
        })
    };

    const verifyEventPayment = async (razorpayEventPaymentData:RazorpayEventPaymentData) => {
        return await handleRequest({
            url: '/api/user/events/verify-book-payment',
            method: 'POST',
            data: razorpayEventPaymentData
        })
    };

    const abortEventPayment = async (userId: string) => {
        return await handleRequest({
            url:'/api/user/events/abort-book-payment',
            method:'PUT',
            data:{
                userId: userId
            }  
        })
    };

    const addMoneyToWallet = async (amount: number, currency: string) => {
        return await handleRequest({
            url:'/api/user/wallet/order',
            method:'POST',
            data:{
              currency:currency,
              amount: amount,
            }
        })
    };

    const verifyWalletPayment = async (razorpayWalletPaymentData: RazorpayWalletPaymentData) => {
        return await handleRequest({
            url:'/api/user/wallet/verify',
            method:'POST',
            data: razorpayWalletPaymentData
        })
    }

    return {controllBlogVoting, controllBlogSharing, completeAccountSetup, walletSubscriptionPayment, createOrderSubscriptionPayment,
        verifySubscriptionPayment, abortSubscriptionPayment,walletEventPayment,createOrderEventPayment,
        verifyEventPayment, abortEventPayment, addMoneyToWallet, verifyWalletPayment,
    }
}