import React from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface CustomMessageToastProps {
    image: string |undefined;
    username: string|undefined;
    message: string |undefined;
    userId?: string  |undefined;
}

interface CustomNotificationToastProps {
  image: string | undefined,
  username: string | undefined,
  notification: string | undefined,
}


export const messageToast = (image: string | undefined, username: string | undefined, message: string, userId?: string) => {
    toast(<CustomMessageToast image={image} username={username} message={message} userId={userId} />, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const CustomMessageToast: React.FC<CustomMessageToastProps> = ({ image, username, message, userId }) => {
    const router = useRouter();

    return (
      <div className="flex items-center gap-3 p-2"
      onClick={() => router.push(`/user/chat/?id=${userId}`)}
      >
        <img src={image} alt="User" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-semibold">{username}</p>
          <p className="text-xs text-gray-500">{message}</p>
        </div>
      </div>
    );
  };


  export const notificationToast = (image: string | undefined, username: string | undefined, notification: string | undefined) => {
    toast(<CustomNotificationToast image={image} username={username} notification={notification} />, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  const CustomNotificationToast: React.FC<CustomNotificationToastProps> = ({ image, username, notification }) => {

    return (
      <div className="flex items-center gap-3 p-2">
        <img src={image} alt="User" className="w-10 h-10 rounded-full object-cover" />
        <div>
          {/* <p className="text-sm font-semibold">{username}</p> */}
          <p className="text-xs text-gray-500">{notification}</p>
        </div>
      </div>
    );
  };