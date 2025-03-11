'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { errorToast, infoToast, successToast, warnToast } from '@/utils/toasts/toast';
import { handlePaymentSuccess, paymentConfirm } from '@/utils/sweet_alert/sweetAlert';
import { useSelector, useDispatch } from 'react-redux';
import { updatePrimeStatus } from '@/store/slices/userSlice';
import { RootState } from '@/store';
import { useFetch } from '@/hooks/fetchHooks/useUserFetch';
import { useUserInteractions } from '@/hooks/crudHooks/user/useUserInteractions';

interface PlanData {
_id: string,
price: string,
planType: string,
isListed: boolean,
}

const PaymentCard: React.FC = () => {
  const [planData, setPlanData] = useState<PlanData>();
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'wallet'>('online');

  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');
  const router = useRouter();

  const user = useSelector((state: RootState) => state.user.userInfo);
  const dispatch = useDispatch();

  const {walletPaymentForSubscrition, subscriptionPayment, verifyPaymentForSubscription, dismissSubscriptionPayment} = useUserInteractions()
  const { getSubscriptionPlanData} = useFetch()
  
  useEffect(() => {
    fetchPlanData()
  },[]);


  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);


  const fetchPlanData = async() => {
    if(!planId) return;
    const response = await getSubscriptionPlanData(planId);

    if(response.data){
        setPlanData(response.data);
    };
  }

  const handlePaymentMethodChange = (method: 'online' | 'wallet') => {
    setPaymentMethod(method);
  };

  const handleBuy = async() => {
     const confirm = await paymentConfirm();
     if(!confirm) return;
    if(paymentMethod == 'wallet'){
      const response = await walletPaymentForSubscrition({
        purpose:'subscription',
        userId:user?.id,
        amount: planData?.price,
        planId: planData?._id,
        planType: planData?.planType,
        isPrime: user?.prime?.isPrime
      })

      if(response.error){
        warnToast(response.error)
      }
      if(response.data){
        await handlePaymentSuccess(true);
        const { isPrime, primeCount, startDate, endDate } = response.data.prime;
        dispatch(
          updatePrimeStatus({
            isPrime,
            primeCount,
            startDate,
            endDate
          })
      );
        successToast('Closer Prime is activated');
        router.push('/user/profile') 
      }
    } else { 
  const response = await subscriptionPayment({
    currency:'INR',
    amount: planData?.price,
    userId: user?.id,
    planId: planId,
    planType: planData?.planType,
    isPrime: user?.prime?.isPrime
  })

  if(response.data){
    const {id, currency, amount} = response.data;

    const options = {
      key: process.env.NEXT_PUBLIC_PAYMENT_KEY_ID, 
      amount: amount, // Amount in paise
      currency: currency,
      name: "Closer Premium",
      description: `${planData?.planType}- Subscription`,
      order_id: id,
      handler: async (response: any) => {
        try {
          // Verify payment on backend
          const verificationResponse = await verifyPaymentForSubscription({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId: user?.id,
            amount: amount,
            planId: planData?._id,
            planType: planData?.planType
          });

          // Handle successful payment
          if (verificationResponse.data) {
            await handlePaymentSuccess(false)
            const { isPrime, primeCount, startDate, endDate } = verificationResponse.data.prime;
              dispatch(
                updatePrimeStatus({
                  isPrime,
                  primeCount,
                  startDate,
                  endDate
                })
              );
            successToast('Closer Prime is activated');
            // dispatch(updateSubscription(verificationResponse.data));
            router.push('/user/profile') 
          } else {
            errorToast('Payment verification failed');
          }
        } catch (verificationError) {
          console.error("Payment verification error:", verificationError);
          errorToast("Something went wrong during payment verification")
        }
      },
      prefill: {
        name: user?.username || "User", 
        email: user?.email || "",
        contact: user?.phone || ""
      },
      notes: {
        planId: planData?._id,
        userId: user?.id || '',
        planType: planData?.planType
      },
      theme: {
        color: "#4e73df"
      },
      modal: {
        ondismiss: async () => {
          if(!user?.id) return
          const response = await dismissSubscriptionPayment(user?.id)
          if(response.data){
            infoToast('Payment cancelled')
          };
        }
      }
    };
    // Open Razorpay checkout
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
    }
   }
 }
  

  return (
    <>
      {/* <div className='flex items-center dark:text-white text-gray-500 cursor-pointer' onClick={goBack} >
       <ChevronLeft size={20}/>
      <span > Back</span>
      </div> */}
    <div className="max-w-md mx-auto mt-10 p-8 dark:bg-darkGray rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      
      <h2 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        Payment Summary
      </h2>

      {/* Plan Details */}
      <div className="flex justify-between items-center mb-8 p-4 bg-gray-100 dark:bg-nightBlack rounded-lg shadow-md">
        <div className="flex items-center">

          <span className="font-medium text-lg text-gray-700 dark:text-gray-200">
            Closer <span className="text-customPink font-bold">Prime</span>
          </span>
        </div>
        <div className="text-right ml-9">
          <p className="font-semibold text-lg text-gray-900 dark:text-white">₹{planData?.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400"> {planData?.planType} subscription</p>
        </div>
      </div>

      {/* Payment Method Options */}
      <div className="mb-8">
        <p className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Choose Payment Method:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`py-3 rounded-lg text-center font-medium shadow-md transition-transform ${
              paymentMethod === 'online'
                ? 'bg-customPink text-white transform scale-105'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => handlePaymentMethodChange('online')}
          >
            Online
          </button>
          <button
            className={`py-3 rounded-lg text-center font-medium shadow-md transition-transform ${
              paymentMethod === 'wallet'
                ? 'bg-customPink text-white transform scale-105'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => handlePaymentMethodChange('wallet')}
          >
            Wallet
          </button>
        </div>
      </div>

      {/* Tax and Total */}
      {/* <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sales Tax</span>
        <span className="font-medium text-gray-900 dark:text-white">₹ 0.00</span>
      </div> */}
      <div className="flex justify-between items-center border-t border-gray-300 dark:border-gray-700 pt-4">
        <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">Total</span>
        <span className="text-xl font-semibold text-customPink">₹{planData?.price}</span>
      </div>

      {/* Buy Button */}
      
      <button
        className="mt-8 w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg py-3 rounded-lg shadow-lg hover:scale-105 transition-transform"
        onClick={handleBuy}
      >
        Buy Now
      </button>

      {/* Secure Checkout Notice */}
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <span className="text-gray-500 font-semibold">Secure Checkout</span>
      </p>
    </div>
    </>
  );
};

export default PaymentCard;
