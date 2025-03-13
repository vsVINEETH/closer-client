"use client";
import { useEffect, useRef } from "react";
import useAxios from "@/hooks/axiosHooks/useAxios";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { errorToast, infoToast } from "@/utils/toasts/toast";
import axios from "axios";

interface Props {
  onLocationFetched?: (success: boolean) => void;
}

const LocationFetcher: React.FC<Props> = ({ onLocationFetched }) => {
const hasShownToast = useRef(false);

  const {handleRequest} = useAxios();

  const userId = useSelector((state: RootState) => state.user?.userInfo?.id)

  // if(!userId){ return };
  useEffect(() => {


    const savedLocation = localStorage.getItem("userLocation");

    if (savedLocation) {
      onLocationFetched?.(true);
      return;
    };

    if (!("geolocation" in navigator)) {
      errorToast('Geolocation is not supported by this browser');
      onLocationFetched?.(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios({
            url: `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            method: 'GET',
            withCredentials: false
          });
         
          const address = response.data.address;
          const formattedLocation = {
            latitude,
            longitude,
            city: address.city || address.town || address.village || "Unknown",
            state: address.state || "Unknown",
            country: address.country || "Unknown",
          };

    

          localStorage.setItem("userLocation", JSON.stringify(formattedLocation));

          await sendLocationToBackend(formattedLocation);
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
  }, []);

  const sendLocationToBackend = async (locationData: any) => {
    try {
      const response = await handleRequest({
        url:'/api/user/update_location',
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
