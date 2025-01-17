"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/userSlice";
import { Wallet, Shield, LogOut, ShieldBanIcon } from "lucide-react";
import useAxios from "@/hooks/useAxios/useAxios";
import { errorToast, infoToast } from "@/utils/toasts/toats";
import { useSocket } from "@/context/SocketContext";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

const settingsItems = [
  { icon: <Wallet size={18} />, text: "Wallet", url: "/user/wallet" },
  { icon: <Shield size={18} />, text: "Security", url: "/user/security" },
  { icon: <ShieldBanIcon size={18} />, text: "Blocked users", url: "/user/blocked" },
  { icon: <LogOut size={18} />, text: "Logout", action: "logout" },
];

interface DropDownProps {
  onMouseLeave: () => void;
}

const DropDown: React.FC<DropDownProps> = ({ onMouseLeave }) => {
  const { handleRequest } = useAxios();
  const dispatch = useDispatch();
  const router = useRouter();
  const { socket } = useSocket();
  const user = useSelector((state: RootState) => state.user.userInfo)

  const handleLogout = async (): Promise<void> => {
    const response = await handleRequest({
      url: "/api/user/logout",
      method: "DELETE",
    });

    if (response.error) {
      errorToast(response.error);
      return;
    }

    if (response.data) {
      dispatch(logout());
      router.push("/user/login");
      if (socket) {
        socket.emit('logout', user?.id);
      }
      infoToast(response.data.message);
      return;
    }
  };

  const handleItemClick = (item: any): void => {
    if (item.action === "logout") {
      handleLogout();
    } else if (item.url) {
      router.push(item.url);
    }
  };
  return (
    <div
      className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-darkGray dark:border-darkGray"
      onMouseLeave={onMouseLeave}
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
