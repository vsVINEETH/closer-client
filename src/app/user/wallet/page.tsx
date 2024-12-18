import React from "react";
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";
import SideBar from "@/components/user/SideBar";
import Wallet from "@/components/user/Wallet";

const WalletPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-row">
        <SideBar />
        <div className="min-h-screen flex-1 p-8">
          <Wallet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WalletPage;
