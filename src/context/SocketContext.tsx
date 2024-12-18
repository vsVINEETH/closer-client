'use client'
import React,{createContext, useContext, useEffect, useState} from 'react'
import { Socket } from 'socket.io-client'
import { connectSocket, disconnectSocket } from '@/utils/socket';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface SocketContextValue {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({socket: null});


export const SocketProvider: React.FC<{children: React.ReactNode}> = ({children}) => {

    const [socket, setSocket] = useState<Socket | null>(null);
    const user = useSelector((state: RootState) => state.user.userInfo);

    useEffect(() => {
        if(!socket){ return }
        socket.emit('register', user?.id);
    },[socket])

    useEffect(() => {
        const socketInstance = connectSocket();
        setSocket(socketInstance);


        return () => {
            disconnectSocket();
        }
    },[]);

    return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    )
};


export const useSocket = (): SocketContextValue => {
    return useContext(SocketContext);
}