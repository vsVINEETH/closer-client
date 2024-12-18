import React from 'react';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import SetupForm from '@/components/user/forms/SetupForm';
const SetupAccount: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-col lg:flex-row items-center justify-center flex-grow px-3 lg:px-0 mt-10 mb-10">
        
        <SetupForm/>
      </div>
      <Footer />
    </div>
  );
}

export default SetupAccount