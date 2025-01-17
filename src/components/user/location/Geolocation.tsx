'use client'

import { useEffect, useState } from "react";
import useAxios from "@/hooks/useAxios/useAxios";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
interface Location {
    latitude: number,
    longitude: number,
}
const GeolocationComponent = () => {
  const [location, setLocation] = useState<Location>({latitude:0, longitude:0});
  const [error, setError] = useState("");
  const {handleRequest} = useAxios()
  
  const user = useSelector((state: RootState) => state.user.userInfo)

  useEffect(() => {
    console.log('calling api');
    getGeoloaction();
  },[location]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
        },
        (err) => setError(err.message),
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  const getGeoloaction = async () => {
    // try {
    //     const response = await handleRequest({
    //         url:'/api/user/reverse-geocode',
    //         method:'POST',
    //         data:{
    //             location,
    //             id: user?.id
    //         }
    //     });
    //     if(response.error){
    //         console.log(response.error)
    //     }

    //     if(response.data){
    //         console.log(response.data);
    //     };
    // } catch (error) {
    //     console.log('something happend in getGeolocation')
    // }
  }


  return (
    <div>
      {/* {location ? (
        <p>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      ) : (
        <p>{error || "Fetching location..."}</p>
      )} */}
    </div>
  );
};

export default GeolocationComponent;
