import React from "react";
import Header from "@/components/reusables/Header";
import Footer from "@/components/reusables/Footer";
import SideBar from "@/components/user/SideBar";
import Wallet from "@/components/user/Wallet";

const WalletPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen select-none caret-transparent">
      <Header htmlFor="user"/>
      <div className="flex flex-row ">
        <SideBar />
        <div className="min-h-screen flex-1 p-8 ">
          <Wallet />
        </div>
      </div>
      <Footer htmlFor="user"/>
    </div>
  );
};

export default WalletPage;
