"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAxios from "@/hooks/axiosHooks/useAxios";
import { updateProfileImage } from "@/store/slices/userSlice";
import { RootState } from "@/store";

const ImageRefreshHandler = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.userInfo);
  const { handleRequest } = useAxios();

  useEffect(() => {
    if (!user?.imageExpiry || !user?.id) return;

    const checkExpiry = () => {
      if ( user?.imageExpiry && Date.now() > user.imageExpiry) {
        updateImageUrls();
      }
    };

    const intervalId = setInterval(checkExpiry, 300000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [user?.imageExpiry, user?.id]); // Depend only on expiry time & user ID

  const updateImageUrls = async () => {
    try {
      if(!user?.id) return;
      const response = await handleRequest({
        url: "/api/user/profile_imageUrl_update",
        method: "GET",
        params: { userId: user.id },
      });

      if (!response?.data) {
        console.error("Response data is undefined, cannot update profile image.");
        return;
      }

      dispatch(updateProfileImage({ 
        image: response.data.image, 
        imageExpiry: response.data.imageExpiry 
      }));

    } catch (error) {
      console.error("Failed to update profile image:", error);
    }
  };

  return null;
};

export default ImageRefreshHandler;
