'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { errorToast, infoToast } from '@/utils/toasts/toast';
import { handlePaymentSuccess, paymentConfirm } from '@/utils/sweet_alert/sweetAlert';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useFetch } from '@/hooks/fetchHooks/useUserFetch';
import { useUserInteractions } from '@/hooks/crudHooks/user/useUserInteractions';


interface EventData {
  id: string,
  price: number,
  isListed: boolean,
  totalEntries: number,
  slots: number,
}

interface PaymentCardProps {
  id: string
}

const EventPaymentCard: React.FC<PaymentCardProps> = ({ id }) => {
    const [eventData, setEventData] = useState<EventData>();
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'wallet'>('online');
    const [selectedSlots, setSelectedSlots] = useState<number>(1);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [error, setError] = useState<string>(''); // Error state to show validation messages
  
    const router = useRouter();
    const eventId = id;
    const user = useSelector((state: RootState) => state.user.userInfo);

    const {getEventData} = useFetch();
    const {walletPaymentForEvent, eventPayment, verifyPaymentForEvent, dismissEventPayment} = useUserInteractions()
  
    useEffect(() => {
      fetchEventData();
    }, []);
  
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
  
    const fetchEventData = async () => {
      const response = await getEventData(eventId);
      if (response.data) {
        setEventData(response.data);
        setTotalPrice(response.data.price); // Initialize total price with the event price
      }
    };
  
    const handlePaymentMethodChange = (method: 'online' | 'wallet') => {
      setPaymentMethod(method);
    };
  
    const handleBuy = async () => { 
      const confirm = await paymentConfirm();
      if(!confirm || !eventData?.slots) return;
      if (selectedSlots > eventData?.slots) {
        setError('Selected slots exceed the available slots or total entries.');
        return; // Stop if validation fails
      }
      if(selectedSlots < 1){
        setError('minimum 1 is required');
        return
      }
      setError(''); // Clear any previous errors
      if (paymentMethod === 'wallet') {
        const response = await walletPaymentForEvent({
          purpose:'Event booking',
          userId: user?.id,
          amount: totalPrice,
          currency: 'INR',
          eventId: eventId, // Send the updated total price,
          slots: selectedSlots,
        })

        if (response.data) {
          await handlePaymentSuccess(true);
          router.push('/user/booking');
        }
      } else {
        const response = await eventPayment({
          currency: 'INR',
          amount: totalPrice, // Send the updated total price
          userId: user?.id,
          eventId: eventId,
          slots:selectedSlots
        });

        if (response.data) {
          const { id, currency, amount } = response.data;
  
          const options = {
            key: process.env.NEXT_PUBLIC_PAYMENT_KEY_ID,
            amount: amount, // Amount in paise
            currency: currency,
            name: 'Closer Premium',
            description: `Event booking`,
            order_id: id,
            handler: async (response: any) => {
              try {
                // Verify payment on backend
                const verificationResponse = await verifyPaymentForEvent({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: user?.id,
                  amount: amount,
                  currency: currency,
                  eventId: eventId,
                  slots: selectedSlots,
                });
  
                // Handle successful payment
                if (verificationResponse.data) {
                 await handlePaymentSuccess(false)
                  router.push('/user/booking');
                } else {
                  errorToast('Payment verification failed');
                }
              } catch (verificationError) {
                console.error('Payment verification error:', verificationError);
                errorToast('Something went wrong during payment verification');
              }
            },
            prefill: {
              name: user?.username || 'User',
              email: user?.email || '',
              contact: user?.phone || '',
            },
            notes: {
              planId: eventId,
              userId: user?.id || '',
            },
            theme: {
              color: '#4e73df',
            },
            modal: {
              ondismiss: async () => {
                if(!user?.id) return
                const response = await dismissEventPayment(user.id);
                if(response.data){
                  infoToast('Payment cancelled')
                };
              },
            },
          };
  
          // Open Razorpay checkout
          const paymentObject = new (window as any).Razorpay(options);
          paymentObject.open();
        }
      }
    };
  
    // Update the total price when the selected slots change
    const handleSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        
      const slots = parseInt(e.target.value, 10);
      if(eventData?.slots && slots > eventData.slots ){
        setError("You exceeded the slot limit");
        return
      }
      if(!(e.target.value).toString().trim() || parseInt(e.target.value) < 1 ){
        setError("You must select at least 1 slot.");
        return;
      }
      setError(''); // Clear error if valid
      setSelectedSlots(slots);
      setTotalPrice(slots * (eventData?.price || 0));

    };
  
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-gradient-to-br from-white to-gray-100 dark:from-darkGray dark:to-darkGray rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-center mb-6 text-gray-800 dark:text-white">Payment Summary</h2>
  
        {/* Plan Details */}
        <div className="flex justify-between items-center mb-8 p-4 bg-gray-100 dark:bg-nightBlack rounded-lg shadow-md">
          <div className="flex items-center">
            <span className="font-medium text-lg text-gray-700 dark:text-gray-200">
              Closer <span className="text-customPink font-bold">Event</span>
            </span>
          </div>
          <div className="text-right ml-9">
          {/* {isNaN(totalPrice) ? 0 : totalPrice}  */}
            <p className="font-semibold text-lg text-gray-900 dark:text-white">₹{eventData?.price}</p>
          </div>
        </div>
  
        {/* Slots Selection */}
        <div className="mb-8">
          <p className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">Select Number of Slots:</p>
          <input
            type="number"
            min="1"
            max={eventData?.slots || 1}
            value={selectedSlots}
            onChange={handleSlotChange}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-nightBlack text-lg text-gray-900 dark:text-gray-200"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>} {/* Display error if any */}
        </div>
  
        {/* Payment Method Options */}
        <div className="mb-8">
          <p className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4">Choose Payment Method:</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              className={`py-3 rounded-lg text-center font-medium shadow-md transition-transform ${paymentMethod === 'online' ? 'bg-customPink  text-white transform scale-105' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
              onClick={() => handlePaymentMethodChange('online')}
            >
              Online
            </button>
            <button
              className={`py-3 rounded-lg text-center font-medium shadow-md transition-transform ${paymentMethod === 'wallet' ? 'bg-customPink  text-white transform scale-105' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
              onClick={() => handlePaymentMethodChange('wallet')}
            >
              Wallet
            </button>
          </div>
        </div>
  
        {/* Total */}
        <div className="flex justify-between items-center border-t border-gray-300 dark:border-gray-700 pt-4">
          <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">Total</span>
          <span className="text-xl font-semibold text-customPink dark:text-lightGray">₹{isNaN(totalPrice) ? 0 : totalPrice}</span>
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
    );
  };
  
export default EventPaymentCard;
  

