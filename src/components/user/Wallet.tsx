'use client';

import React, { useState, useEffect } from "react";
import useAxios from "@/hooks/useAxios/useAxios";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { errorToast, successToast, warnToast } from "@/utils/toasts/toats";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  paymentType: string;
  description: string;
}

interface Errors {
amount?:string,
description?:string,
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(0); // Initial balance
  const [history, setHistory] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});

  const user = useSelector((state: RootState) => state.user.userInfo)
  const {handleRequest} = useAxios();
  const router = useRouter();

  useEffect(() => {
    fetchData()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(validate()){
      handleBuy()
    }
  }

  const handleBuy = async () => {

    const response = await handleRequest({
      url:'/api/user//wallet_create_order',
      method:'POST',
      data:{
        currency:'INR',
        amount: amount,
      }

    });

    if(response.error){
      errorToast(response.error)
    };

    if(response.data){
      console.log(response.data)
      const {id, currency, amount} = response.data;

      const options = {
        key: process.env.NEXT_PUBLIC_PAYMENT_KEY_ID, 
        amount: amount, // Amount in paise
        currency: currency,
        name: "Closer Premium",
        description: `Adding money closer wallet`,
        order_id: id,
        handler: async (response: any) => {
          console.log(response)
          try {
            // Verify payment on backend
            const verificationResponse = await handleRequest({
              url:'/api/user/wallet_verify_payment',
              method:'POST',
              data:{
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user?.id,
                amount: amount,
                description: description,
              }

            });

            // Handle successful payment
            if (verificationResponse.data) {
              successToast('Money added to your wallet');
              console.log(verificationResponse.data);
              setBalance(verificationResponse.data.balance);
              setHistory(verificationResponse.data.transactions);

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
          userId: user?.id || '',
        },
        theme: {
          color: "#4e73df"
        },
        modal: {
          ondismiss: () => {
            errorToast('Payment cancelled')
          }
        }
      };

      // Open Razorpay checkout
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      }
    }

    const fetchData = async () => {
      console.log('Fetching wallet data...');
      const response = await handleRequest({
        url: '/api/user/wallet',
        method: 'GET',
        params: { id: user?.id },
      });
    
      if (response.data) {
        console.log('Wallet data:', response.data);
        setBalance(response.data.balance);
        setHistory(response.data.transactions)
      } else if (response.error) {
        errorToast(response.error);
      }
    };
    
  const validate = (): boolean => {

    const newError: Errors = {};

    const numericAmount = parseFloat(amount);
    const descriptionText = description;
   if (isNaN(numericAmount)) {
       newError.amount = 'The amount should be in numbers'
    }else if( numericAmount <= 0){
      newError.amount = 'The amount should greaterthan zero'
    }

    if(!descriptionText.trim()){
      newError.description = 'This field is empty'
    }

    setErrors(newError);
    return Object.keys(newError).length === 0
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      {/* Wallet Section */}
      <div className="w-full md:w-1/3 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Wallet</h2>
        <p className="text-lg text-green-600 font-bold mb-4">Balance: ₹{balance.toFixed(2)}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name='amount'
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          {errors && errors.amount && <span className="text-red-500">{errors.amount}</span>}
          <input
            type="text"
            name='description'
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          {errors && errors.description && <span className="text-red-500">{errors.description}</span>}
          <button type="submit" className="w-full bg-customPink text-white py-2 rounded-md"
          >
            Add Money
          </button>
        </form>
      </div>

      {/* Transaction History Section */}
      <div className="w-full flex-1 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        <div className="max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-gray-500">No transactions found.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex justify-between items-center p-4 bg-gray-100 rounded-md"
                >
                  <div>
                    <p className="font-bold">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{new Date(transaction.createdAt).toLocaleDateString() }</p>
                  </div>
                  {transaction?.paymentType === 'debit' ?
                  <p className="font-bold text-green-600">
                    +₹{transaction.amount.toFixed(2)}
                  </p> 
                  :
                  <p className="font-bold text-red-500">
                  -₹{transaction.amount.toFixed(2)}
                </p> 
                  }
                  
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
