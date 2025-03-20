import { io, Socket} from 'socket.io-client'

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if(!socket){
        socket = io(process.env.NEXT_PUBLIC_BACKEND_URL,{
            withCredentials:true,
            autoConnect: true,
        });
    }

    return socket;
};

export const disconnectSocket = (): void => {
    if(socket) {
        socket.disconnect();
        socket = null;
    };
};