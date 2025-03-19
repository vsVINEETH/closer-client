import useAxios from "@/hooks/axiosHooks/useAxios";
import {SubscriptionPaymentWalletData, SubscriptionPaymentData,
    RazorpaySubscriptionPaymentData, EventBookingData,EventPaymentData, RazorpayEventPaymentData, RazorpayWalletPaymentData
 } from "@/types/customTypes";

export const useUserInteractionService = () => {
    const {handleRequest} = useAxios();

    const controllBlogVoting = async (userId: string, blogId: string, voteType: string) => {
        return await handleRequest({
            url: '/api/user/content_vote',
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
            url: '/api/user/content_share',
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
            url:'/api/user/wallet_payment',
            method:'POST',
            data:subscriptionPaymentData
        })
    };

    const createOrderSubscriptionPayment = async (subscriptionPaymentData: SubscriptionPaymentData) => {
        return await handleRequest({
            url:'/api/user/create_order',
            method:'POST',
            data:subscriptionPaymentData
        })
    };

    const verifySubscriptionPayment = async (razorpaySubscriptionPaymentData: RazorpaySubscriptionPaymentData) => {
        return await handleRequest({
            url:'/api/user/verify_payment',
            method:'POST',
            data: razorpaySubscriptionPaymentData
        })
    };

    const abortSubscriptionPayment = async (userId: string) => {
        return await handleRequest({
            url:'/api/user/abort_payment',
            method:'PUT',
            data:{
              userId: userId
            } 
        })
    };


    const walletEventPayment = async (eventBookingData: EventBookingData) => {
        return await handleRequest({
            url: '/api/user/wallet_payment',
            method: 'POST',
            data: eventBookingData
        })
    };

    const createOrderEventPayment = async (eventPaymentData: EventPaymentData) => {
        return await handleRequest({
            url: '/api/user/book_order',
            method: 'POST',
            data: eventPaymentData
        })
    };

    const verifyEventPayment = async (razorpayEventPaymentData:RazorpayEventPaymentData) => {
        return await handleRequest({
            url: '/api/user/verify_book_payment',
            method: 'POST',
            data: razorpayEventPaymentData
        })
    };

    const abortEventPayment = async (userId: string) => {
        return await handleRequest({
            url:'/api/user/abort_book_payment',
            method:'PUT',
            data:{
                userId: userId
            }  
        })
    };

    const addMoneyToWallet = async (amount: number, currency: string) => {
        return await handleRequest({
            url:'/api/user//wallet_create_order',
            method:'POST',
            data:{
              currency:currency,
              amount: amount,
            }
        })
    };

    const verifyWalletPayment = async (razorpayWalletPaymentData: RazorpayWalletPaymentData) => {
        return await handleRequest({
            url:'/api/user/wallet_verify_payment',
            method:'POST',
            data: razorpayWalletPaymentData
        })
    }

    return {controllBlogVoting, controllBlogSharing, completeAccountSetup, walletSubscriptionPayment, createOrderSubscriptionPayment,
        verifySubscriptionPayment, abortSubscriptionPayment,walletEventPayment,createOrderEventPayment,
        verifyEventPayment, abortEventPayment, addMoneyToWallet, verifyWalletPayment,
    }
}