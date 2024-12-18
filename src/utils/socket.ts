import { io, Socket} from 'socket.io-client'

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if(!socket){
        socket = io("http://localhost:5000",{
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