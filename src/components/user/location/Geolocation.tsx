"use client";
import { useEffect, useRef } from "react";
import useAxios from "@/hooks/axiosHooks/useAxios";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { errorToast, infoToast } from "@/utils/toasts/toast";
import { useFetch } from "@/hooks/fetchHooks/useUserFetch";

interface Props {
  onLocationFetched?: (success: boolean) => void;
}

const LocationFetcher: React.FC<Props> = ({ onLocationFetched }) => {
  const hasShownToast = useRef(false);
  const hasFetched = useRef(false);
  const {handleRequest} = useAxios();
  const {getUserLocation} = useFetch()

  const userId = useSelector((state: RootState) => state.user?.userInfo?.id)


  useEffect(() => {

    if(!userId){ return };
    if (hasFetched.current) return;
    hasFetched.current = true;

    const savedLocation = localStorage.getItem("userLocation");

    if (savedLocation) {
      onLocationFetched?.(true);
      return;
    };

    if (!("geolocation" in navigator)) {
      errorToast('Geolocation is not supported by this browser');
      onLocationFetched?.(false);
      return;
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await getUserLocation(latitude, longitude);
          localStorage.setItem("userLocation", JSON.stringify(response.data));

          await sendLocationToBackend(response.data);
          onLocationFetched?.(true);
        } catch (err) {
          console.error(err)
          errorToast('Failed to fetch address')
          onLocationFetched?.(false);
        }
      },
      (err) => {
        if (!hasShownToast.current) {
          infoToast("Location access is required");
          hasShownToast.current = true; // Mark as shown
        }
        onLocationFetched?.(false);
        console.error(err)
      }
    );
  }, [userId]);
  

  const sendLocationToBackend = async (locationData: any) => {
    try {
      const response = await handleRequest({
        url:'/api/user/location',
        method:'POST',
        data: {locationData, userId },
      })
      if(response.error){
        console.error(response.error);
        errorToast('falied to save location')
      }
      if(response.data){
        console.log("Location saved to DB");
      }
    } catch (error) {
      errorToast("Failed to save location to server")
      console.error("Error sending location:", error);
    }
  };

  return  null
};

export default LocationFetcher;
