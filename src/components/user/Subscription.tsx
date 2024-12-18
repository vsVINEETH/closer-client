'use client';
import React, { useState, useEffect } from 'react';
import useAxios from "../../hooks/useAxios/useAxios";
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
const Subscription: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null); // Track the selected plan
  const router = useRouter()
  const { handleRequest } = useAxios();


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await handleRequest({
      url: '/api/user/subscription',
      method: 'GET',
    });

    if (response.error) {
      console.error(response.error);
    }

    if (response.data) {
        console.log(response.data)
      setSubscriptions(response.data);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Closer <span className="text-customPink">Prime</span>
        </h1>
      </header>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          First class dating experience
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          What will you get as a Prime member?
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-2">
          <li>Prime discovery complete access</li>
          <li>Get priority in matching</li>
          <li>Send unlimited interests to everyone</li>
          <li>Video chat in person</li>
        </ul>

        {/* Pricing Options */}
        <div className="flex justify-evenly items-center mt-6 space-x-4">
          {subscriptions .filter((plan: any) => plan.isListed).map((plan: any) => (
            
            <div
              key={plan._id}
              onClick={() => handlePlanSelect(plan._id)} // Handle plan selection
              className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer ${
                selectedPlan === plan._id
                  ? 'border-customPink bg-pink-100 dark:bg-pink-800'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  selectedPlan === plan._id
                    ? 'text-customPink'
                    : 'text-gray-800 dark:text-white'
                }`}
              >
                {plan.planType === 'weekly'
                  ? '1 Week'
                  : plan.planType === 'monthly'
                  ? '1 Month'
                  : '1 Year'}
              </p>
              <p
                className={`text-xs ${
                  selectedPlan === plan._id
                    ? 'text-customPink'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                ₹{plan.price}
              </p>
            </div>
        
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            disabled={!selectedPlan} // Disable the button if no plan is selected
            className={`w-full py-2 text-white text-sm font-medium rounded-lg shadow-md ${
              selectedPlan
                ? 'bg-customPink hover:bg-red-500'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={handleToCheckout}
          >
            Continue
          </button>
          <Link href="/user/profile" className="mt-5 text-sm text-gray-600 dark:text-gray-400">
          No Thanks
          </Link>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          By tapping continue, you will be charged and your subscription will
          renew for the same price and package length until you cancel via
          Account settings, and you agree to our terms.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
