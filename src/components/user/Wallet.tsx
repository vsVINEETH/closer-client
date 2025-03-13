'use client';

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { errorToast, successToast } from "@/utils/toasts/toast";
import { motion } from "framer-motion";
import { useUserInteractions } from "@/hooks/crudHooks/user/useUserInteractions";
import { useFetch } from "@/hooks/fetchHooks/useUserFetch";
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
  const {addMoney, verifyWalletPay} = useUserInteractions();
  const {getWalletData} = useFetch()

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

    const response = await addMoney(Number(amount), 'INR')

    if(response.error){
      errorToast(response.error)
    };

    if(response.data){
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
            const verificationResponse = await verifyWalletPay({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user?.id,
              amount: amount,
              description: description,
            })
         
            // Handle successful payment
            if (verificationResponse.data) {
              successToast('Money added to your wallet');
              console.log(verificationResponse.data);
              setBalance(verificationResponse.data.balance);
              setHistory(verificationResponse.data.transactions.reverse());
              setAmount('');
              setDescription('');

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
            setAmount('');
            setDescription('');
          }
        }
      };

      // Open Razorpay checkout
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      }
    }

    const fetchData = async () => {
      if(!user?.id) return
      const response = await getWalletData(user.id)
      if (response.data) {
        setBalance(response.data.balance || 0);
        setHistory(response.data.transactions || []);
      };
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
    <motion.div 
    className="flex flex-col gap-8 md:flex-row "
    initial={{ opacity: 0, y: 50 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    {/* Wallet Section */}
    <motion.div 
      className="w-full md:w-1/3 bg-white dark:bg-darkGray shadow-lg rounded-lg p-6 border-t-4 border-customPink "
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-4 dark:text-lightGray">Wallet</h2>
      <p 
        className="text-2xl text-green-600 dark:text-lightGray font-extrabold mb-4" 
        // animate={{ scale: [1, 1.1, 1] }} 
        // transition={{ repeat: Infinity, duration: 2 }}
      >
        Balance: ₹{balance && balance.toFixed(2)}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name='amount'
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-customPink dark:focus:ring-gray-600 transition"
        />
        {errors?.amount && <span className="text-red-500">{errors.amount}</span>}
        <input
          type="text"
          name='description'
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-customPink dark:focus:ring-gray-600 transition"
        />
        {errors?.description && <span className="text-red-500">{errors.description}</span>}
        <motion.button 
          type="submit" 
          className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 rounded-md shadow-lg hover:scale-105 transition"
          whileTap={{ scale: 0.95 }}
        >
          Add Money
        </motion.button>
      </form>
    </motion.div>

    {/* Transaction History Section */}
    <motion.div 
      className="w-full flex-1 bg-white dark:bg-darkGray mb-4  shadow-lg rounded-lg p-6 border-t-4 border-blue-500"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-semibold dark:text-lightGray mb-3">Transaction History</h2>
      <div className="max-h-96 overflow-y-auto scrollable-container custom-scroll">
        {history.length === 0 ? (
          <p className="text-gray-500">No transactions found.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((transaction, index) => (
              <motion.li 
                key={transaction.id} 
                className={`${
                  index % 2 === 0 ? "bg-white dark:bg-nightBlack dark:hover:bg-black " : "bg-gray-50 dark:bg-darkGray dark:hover:bg-gray-600"
                }   hover:bg-gray-100 flex justify-between items-center p-4 rounded-md shadow-sm border-l-4 border-blue-300 transition-all`}

                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div>
                  <p className="font-bold dark:text-lightGray">{transaction.description}</p>
                  <p className="text-sm text-gray-600 dark:text-lightGray">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                </div>
                <p className={`font-bold  ${transaction.paymentType === 'debit' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {transaction.paymentType === 'debit' ? `+₹${transaction.amount.toFixed(2)}` : `-₹${transaction.amount.toFixed(2)}`}
                </p>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>

  </motion.div>
  );
};

export default Wallet;
