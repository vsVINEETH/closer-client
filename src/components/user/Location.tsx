'use client'
import React, { useEffect } from 'react'
import useAxios from '@/hooks/useAxios/useAxios'

const Location: React.FC = () => {
    const { handleRequest } = useAxios();
    useEffect(() => {
        const getLocation = async () => {
            try {
                const response = await handleRequest({
                    url: 'https://cors-anywhere.herokuapp.com/https://ipapi.co/json/',
                    method: 'GET',
                });
                console.log(response, 'hello'); // Log the response
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        };

        getLocation();
    }, []);
    
    return(<></>)
}

export default Location