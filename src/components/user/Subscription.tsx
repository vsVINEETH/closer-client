'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/fetchHooks/useUserFetch';

const Subscription: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null); // Track the selected plan
  const router = useRouter()
  const {getSubscriptionData} = useFetch()

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    const response = await getSubscriptionData()

    if (response.data) {
       setSubscriptions(response.data.subscription);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleToCheckout = () => {
    if(selectedPlan){
        router.push(`/user/checkout?planId=${selectedPlan}`)
    }
  }

  return (
<>
  {/* Main Container */}
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-nightBlack px-4">
    {/* Header */}
    <header className="text-center mb-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
        Closer <span className="text-customPink">Prime</span>
      </h1>
    </header>

    {/* Card Content */}
    <div className="bg-white dark:bg-darkGray shadow-lg rounded-xl p-8 max-w-md w-full">
      {/* Introduction */}
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
        First-class dating experience
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        What will you get as a Prime member?
      </p>
      <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-2">
        <li>Prime discovery complete access</li>
        <li>Get priority in matching</li>
        <li>No more advertisement</li>
        <li>Video chat in person</li>
        <li>Audio narration while reading blogs</li>
      </ul>

      {/* Subscription Plans */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        {subscriptions?.filter((plan: any) => plan.isListed).map((plan: any) => (
          <div
            key={plan._id}
            onClick={() => handlePlanSelect(plan._id)}
            className={`flex flex-col items-center px-4 py-3 border rounded-lg cursor-pointer transition ${
              selectedPlan === plan._id
                ? "border-customPink bg-pink-50 dark:bg-pink-900 shadow-md scale-105"
                : "border-gray-300 dark:border-gray-600 hover:border-customPink"
            }`}
          >
            <p className={`text-sm font-medium ${selectedPlan === plan._id ? "text-customPink dark:text-white" : "text-gray-900 dark:text-white"}`}>
              {plan.planType === "weekly" ? "1 Week" : plan.planType === "monthly" ? "1 Month" : "1 Year"}
            </p>
            <p className={`text-xs ${selectedPlan === plan._id ? "text-customPink dark:text-lightGray" : "text-gray-600 dark:text-gray-400"}`}>
              ₹{plan.price}
            </p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 text-center">
        <button
          disabled={!selectedPlan}
          className={`w-full py-3 text-white text-sm font-semibold rounded-lg shadow-md transition ${
            selectedPlan ? "bg-customPink hover:bg-red-500" : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={handleToCheckout}
        >
          Continue
        </button>
        <Link href="/user/profile" className="mt-4 block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition">
          No Thanks
        </Link>
      </div>

      {/* Terms */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        By tapping continue, you will be charged, and your subscription will renew for the same price and package length until you cancel via Account settings. By proceeding, you agree to our terms.
      </p>
    </div>
  </div>
</>

  );
};

export default Subscription;
