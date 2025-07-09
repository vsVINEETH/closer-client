"use client";
import React, { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Shield, LogOut, ShieldBanIcon,  TicketCheck  } from "lucide-react";
import { infoToast } from "@/utils/toasts/toast";
import { useSocket } from "@/context/SocketContext2";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { logoutConfirm } from "@/utils/sweet_alert/sweetAlert";
import { useAuth } from "@/hooks/authHooks/useUserAuth";
import { useTranslations } from "next-intl";
interface settingKeys {
  icon: ReactElement;
  text: string;
  url?: string; // Make URL optional since some items have `action` instead
  action?: string;
}
const settingsItems = [
  { icon: <Wallet size={18} />, text: "Wallet", url: "/user/wallet" },
  { icon: <Shield size={18} />, text: "Security", url: "/user/security" },
  { icon: <ShieldBanIcon size={18} />, text: "Blocked users", url: "/user/blocked" },
  { icon: <TicketCheck  size={18} />, text: "Confirmed Events", url: "/user/booking" },
  { icon: <LogOut size={18} />, text: "Logout", action: "logout" },

];


const DropDown: React.FC = () => {
  const {handleLogout} = useAuth();
  const { logoutUser } = useSocket();
  const router = useRouter();
 
  const user = useSelector((state: RootState) => state.user.userInfo)

  const proceedLogout = async (): Promise<void> => {
    const confirm = await logoutConfirm();
    if(!confirm){ return }
     await handleLogout();
     localStorage.clear();
      // localStorage.removeItem('currentTab');
      // localStorage.removeItem('matches');
      infoToast('Successfully logged out');
      logoutUser(user?.id ? user.id : '');
      return;
  };

  const handleItemClick = (item: settingKeys): void => {
    if (item.action === "logout") {
      proceedLogout();
    } else if (item.url) {
      router.push(item.url);
    }
  };

  return (
  <div
    className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-darkGray dark:border-darkGray mt-11 z-50"
  >

      {settingsItems.map((item, index) => (
        <button
          key={index}
          className="w-full flex items-center rounded-md gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-lightGray dark:hover:text-darkGray"
          onClick={() => handleItemClick(item)}
        >
          {item.icon}
          <span>{item.text}</span>
        </button>
      ))}
    </div>
  );
};

export default DropDown;
