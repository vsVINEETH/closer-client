"use client";
import { useState } from "react";
import { useUserInteractionService } from "@/services/userServices/userInteractionService";
import {EventBookingData,EventPaymentData,RazorpayEventPaymentData, SubscriptionPaymentData, SubscriptionPaymentWalletData, RazorpaySubscriptionPaymentData, RazorpayWalletPaymentData } from "@/types/customTypes";
import { errorToast, warnToast } from "@/utils/toasts/toast";
import { useLoading } from "@/context/LoadingContext";

export const useUserInteractions = () => {
    const {controllBlogVoting, controllBlogSharing, completeAccountSetup,
        createOrderSubscriptionPayment, verifySubscriptionPayment, abortSubscriptionPayment,
        walletSubscriptionPayment,walletEventPayment, createOrderEventPayment,
        abortEventPayment,verifyEventPayment, addMoneyToWallet, verifyWalletPayment
    } = useUserInteractionService();

    const {isLoading, setLoading} = useLoading()
    const [error, setError] = useState<string | null>(null);
  
    const manageBlogVoting = async (userId: string, blogId: string, votetype: string) => {
        setLoading(true);
        const response = await controllBlogVoting( userId, blogId, votetype);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const manageBlogSharing = async (userId: string, blogId: string) => {
        setLoading(true);
        const response = await controllBlogSharing( userId, blogId);
        if(response.error){
            setError(response.error)
            errorToast("Something went wrong while logging the share.");
        }
        setLoading(false);
        return response;
    };

    const setupAccount = async (accountSetupDetails: FormData) => {
        setLoading(true);
        const response = await completeAccountSetup(accountSetupDetails);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response;
    };
 //   createOrderSubscriptionPayment, verifySubscriptionPayment, abortSubscriptionPayment,
    const walletPaymentForSubscrition = async (subscriptionPaymentData: SubscriptionPaymentWalletData) => {
        setLoading(true);
        const response = await walletSubscriptionPayment(subscriptionPaymentData);
        if(response.error){
            setError(response.error)
            warnToast(response.error)
        }
        setLoading(false);
        return response;
    };

    const subscriptionPayment = async (subscriptionPaymentData: SubscriptionPaymentData) => {
        setLoading(true);
        const response = await createOrderSubscriptionPayment(subscriptionPaymentData);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const verifyPaymentForSubscription = async (razorpaySubscriptionPaymentData: RazorpaySubscriptionPaymentData) => {
        setLoading(true);
        const response = await verifySubscriptionPayment(razorpaySubscriptionPaymentData);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const dismissSubscriptionPayment = async (userId: string) => {
        setLoading(true);
        const response = await abortSubscriptionPayment(userId);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const walletPaymentForEvent = async (eventBookingData: EventBookingData) => {
        setLoading(true);
        const response = await walletEventPayment(eventBookingData);
        if(response.error){
            setError(response.error)
            warnToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const eventPayment = async (eventPaymentData: EventPaymentData) => {
        setLoading(true);
        const response = await createOrderEventPayment(eventPaymentData);
        if(response.error){
            setError(response.error)
            warnToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const verifyPaymentForEvent = async (razorpayEventPaymentData: RazorpayEventPaymentData) => {
        setLoading(true);
        const response = await verifyEventPayment(razorpayEventPaymentData);
        if(response.error){
            setError(response.error)
            warnToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const dismissEventPayment = async (userId: string) => {
        setLoading(true);
        const response = await abortEventPayment(userId);
        if(response.error){
            setError(response.error)
            warnToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const addMoney = async (amount: number, currency: string) => {
        setLoading(true);
        const response = await addMoneyToWallet(amount, currency);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response;
    };

    const verifyWalletPay = async (razorpayWalletPaymentData: RazorpayWalletPaymentData) => {
        setLoading(true);
        const response = await verifyWalletPayment(razorpayWalletPaymentData);
        if(response.error){
            setError(response.error)
            errorToast(response.error);
        }
        setLoading(false);
        return response;
    }


    return {isLoading, error, manageBlogVoting, manageBlogSharing, setupAccount, 
        walletPaymentForSubscrition, subscriptionPayment, verifyPaymentForSubscription, 
        dismissSubscriptionPayment, walletPaymentForEvent, eventPayment, verifyPaymentForEvent,
        dismissEventPayment, addMoney, verifyWalletPay

    }
}