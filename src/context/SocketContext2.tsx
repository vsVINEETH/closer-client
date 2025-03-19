import React, {
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/utils/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Peer, { SignalData } from "simple-peer";
import { messageToast, notificationToast } from "@/utils/toasts/customToast";
import { usePathname, useSearchParams } from "next/navigation";

interface iSocketContext {
  onlineUsers: SocketUser[] | null;
  ongoingCall: OngoingCall | null;
  localStream: MediaStream | null;
  peer: PeerData | null;
  handleCall: (user: SocketUser, isAudio: boolean) => void;
  handleJoinCall: (ongoingCall: OngoingCall) => void;
  handleHangup: (data: { ongoingCall?: OngoingCall, isEmitHangUp?: boolean, isMissed?: boolean}) => void;
  isCallEnded: boolean;
  isVoiceCall: boolean;
  setVoiceCall: (value: boolean) => void;
  socket: Socket | null;
  logoutUser: (userId: string) => void;
  receivedMessage: Chats | undefined,
  checkOnlineStatus: (oppositeUserId: string) => void;
  handleStatus : (oppositeUserId: string | null) => void;
  oppositeUserIsOnline: boolean;
  callLogHandler: (ongoingCall: OngoingCall | null, participants?:{caller?: string, receiver?: string, callType?: string, callDuration?: number, type?:string, isMissed?: boolean} | null) =>  void;
}

export type SocketUser = {
  userId: string;
  socketId: string;
  profile: {
    username: string;
    image: string;
  };
};

type Participants = {
  caller: SocketUser;
  receiver: SocketUser;
  isVoiceCall: boolean;
};

export type OngoingCall = {
  participants: Participants;
  isRinging: boolean;
  isVoiceCall?: boolean;
};

type PeerData = {
  peerConnection: Peer.Instance;
  stream: MediaStream | undefined;
  participantUser: SocketUser;
};

interface Chats {
  _id?: string,
  sender: string,
  senderProfile?: {
    _id: string,
    username: string,
    image: string[],
  }
  receiver: {
    _id: string,
    username: string,
    image: string,
  },
  message: string,
  type: string,
  callType: string,
  callDuration: number,
  isMissed: boolean,
  isRead: boolean,
  status: string,
  createdAt: string,
}

export const SocketContext2 = createContext<iSocketContext | null>(null);

export const SocketContextProvider = ({ children}: {children: React.ReactNode}) => {

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [connect, setConnect] = useState<boolean>(false);
  const [isCallEnded, setIsCallEnded] = useState<boolean>(false);
  const [isVoiceCall, setIsVoiceCall] = useState<boolean>(false);

  const [message, setMessages] = useState<Chats>();
  const [oppositeUserId, setOppositeUserId] = useState<string | undefined>();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const user = useSelector((state: RootState) => state?.user.userInfo);
  const currentSocketUser = onlineUsers?.find(
    (onlineUser) => onlineUser.userId === user?.id
  );

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<PeerData | null>(null);

  const setVoiceCall = (value : boolean) => {
    setIsVoiceCall(value);
  };

  const logoutUser = (userId: string) => {
    if(socket){
      socket.emit('logout', userId)
    };
  };

  const getMediaStream = async (faceMode?: string, isAudio?: boolean) => {
    if (localStream) {
      return localStream;
    }
  
    try {
      //const devices = await navigator.mediaDevices.enumerateDevices();
      // const videoDevices = !isVoiceCall
      //   ? devices.filter((device) => device.kind === "videoinput")
      //   : devices.filter((device) => device.kind === "audioinput");
  
      const constraints: MediaStreamConstraints = isAudio || isVoiceCall
        ? { audio: true, video: false }
        : {
            audio: true,
             video: true
            // video: {
            //   width: { min: 640, ideal: 1280, max: 1920 },
            //   height: { min: 360, ideal: 720, max: 1080 },
            //   frameRate: { min: 16, ideal: 30, max: 30 },
            //   facingMode: videoDevices.length > 0 ? faceMode : undefined,
            // },
          };
  
      console.log("Constraints used:", constraints);
  
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!stream) {
        throw new Error("No media stream received");
      }
  
      console.log("Stream obtained:", stream);
      
      setLocalStream(stream);
  
      return stream;
    } catch (error) {
      console.error("Failed to get the stream:", error);
      setLocalStream(null);
      return null;
    }
  };
  
  //showing the notification
  const onIncomingCall = (participants: Participants) => {
    setConnect(true);
    setIsVoiceCall(participants.isVoiceCall);
    setOngoingCall({
      participants,
      isRinging: true,
      isVoiceCall: participants.isVoiceCall
    });
  };

  //end
  const handleHangup = (data: {
    ongoingCall?: OngoingCall | null,
    isEmitHangUp?: boolean,
    isMissed?:boolean,
  }) => {

    if (socket && user?.id && data?.ongoingCall && data?.isEmitHangUp) {
      const { caller, receiver, isVoiceCall } = data.ongoingCall.participants;
      const callType = isVoiceCall ? "audio" : "video"; 
      
      socket.emit("hangup", {
        ongoingCall: data.ongoingCall,
        userHangingupId: user.id,
        callDuration: callDuration,
      });

      let typeOfCall: string;
      if(caller.userId == user.id && callType === 'audio' && callDuration <= 0){
        typeOfCall = 'noAudioAnswer'
      }else if (caller.userId == user.id  && callType === 'video' && callDuration <= 0){
        typeOfCall = 'noVideoAnswer'
      }else if( receiver.userId == user.id  && callType === 'audio'){
        typeOfCall = 'missedAudio'
       }else if( receiver.userId == user.id  && callType === 'video'){
        typeOfCall = 'missedVideo'
       }else{
        typeOfCall = callType;
       };
      
        setMessages({
          sender: caller.userId,
          receiver: {
            _id: receiver.userId,
            username: receiver.profile.username,
            image: receiver.profile.image,
          },
          callType: typeOfCall,
          callDuration: callDuration,
          message: `${callType} call ended`, // Optional message
          type: "call",
          isMissed: isCallEnded === false, // If duration is 0, mark as missed
          isRead: false,
          status: "read",
          createdAt: new Date().toISOString(),
        });
      
    }
    
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  
    if(data?.isMissed === true ){
      callLogHandler(ongoingCall,{isMissed: true})
    }else if(data?.isMissed === false){
      callLogHandler(ongoingCall,{isMissed: false})
    }
    
    setIsCallEnded(true);
    setOngoingCall(null);
    if (peer) {
      peer?.peerConnection.destroy();
    }
    setPeer(null); 
  };

  // create peer
  const createPeer =  async (stream: MediaStream, initiator: boolean) => {
    const iceServers: RTCIceServer[] = [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
        ],
      },
    ];

    const peer = new Peer({
      initiator: initiator,
      trickle: false,
      stream: stream,
      config: { iceServers },
    });

    peer.on("stream", (remoteStream) => {
      setPeer((prevPeer) => {
        if (prevPeer) {
          return { ...prevPeer, stream: remoteStream };
        }
        return prevPeer;
      });
    });

    peer.on("error", (err) => {
      console.error(err);
      handleHangup({});
    });

    peer.on("close", () => {
      handleHangup({});
    });

    // Debug peer connection states
    const rtcPeerConnection: RTCPeerConnection = (peer as unknown as { _pc: RTCPeerConnection })._pc;

    rtcPeerConnection.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", rtcPeerConnection.iceConnectionState);
      
      setTimeout(() => {
        if (
          rtcPeerConnection.iceConnectionState === "disconnected" ||
          rtcPeerConnection.iceConnectionState === "failed"
        ) {
          console.warn("Call disconnected, hanging up...");
          handleHangup({});
        }
      }, 5000); 
    };
    

    return peer;
  };

  //initiate call
  const handleCall = async (user: SocketUser, isAudio: boolean) => {
    setIsCallEnded(false);
    setConnect(false)
    if (!currentSocketUser || !socket) return;
    const stream = await getMediaStream('faceMode', isAudio);
    if (!stream) {
      console.error("No stream in handleCall");
      return;
    }

    const participants = {
      caller: currentSocketUser,
      receiver: user,
      isVoiceCall: isAudio,
    };

    setOngoingCall({
      participants,
      isRinging: false,
      isVoiceCall: isAudio,
    });

    setIsVoiceCall(isAudio);
    // Create peer as initiator
    const newPeer = await createPeer(stream, true);
    setPeer({
      peerConnection: newPeer,
      participantUser: user,
      stream: undefined,
    });

    // Listen for signals before emitting call
    newPeer.on("signal", (signalData: SignalData) => {
      console.log("Caller signal generated:", signalData);
      if (socket) {
        socket.emit("webrtcSignal", {
          sdp: signalData,
          ongoingCall: {
            participants,
            isRinging: false,
            isVoiceCall: isAudio,
          },
          isCaller: true,
        });
      }
    });

    socket.emit("call", participants);
  };

  // accept call
  const handleJoinCall = async (ongoingCall: OngoingCall) => {
    setIsCallEnded(false);
    setConnect(false)
    setIsVoiceCall(ongoingCall.isVoiceCall as boolean);
    setOngoingCall((prev) => {
      if (prev) {
        return { ...prev, isRinging: false };
      }
      return prev;
    });

   const stream = await getMediaStream('faceMode', ongoingCall.isVoiceCall);
    
    if (!stream) {
      console.error("Could not get stream in handleJoinCall");
      return;
    }
    setLocalStream(stream);

    // Create peer as non-initiator for answering
    const newPeer = await createPeer(stream, false);
    setPeer({
      peerConnection: newPeer,
      participantUser: ongoingCall.participants.caller,
      stream: undefined,
    });

    newPeer.on("signal", (signalData: SignalData) => {
      console.log("Receiver signal generated:", signalData);
      if (socket) {
        socket.emit("webrtcSignal", {
          sdp: signalData,
          ongoingCall,
          isCaller: false,
        });
      }
    });
  };

  //call log handler
  const callLogHandler = (ongoingCall: OngoingCall | null, participants?:{caller?: string, receiver?: string, callType?: string, callDuration?: number, type?:string, isMissed?: boolean} | null) => {
    if(socket){
      socket.emit('missedcall', {...ongoingCall, callDuration:callDuration, type:'call', callType: isVoiceCall ? 'audio':'video', isMissedCall: participants?.isMissed ,...participants});
      setOngoingCall(null);
      setIsVoiceCall(false);
    }
  }
  
  //async if needed
  //establish peer connection
  const completePeerConnection = async (data: {
    sdp: SignalData;
    ongoingCall: OngoingCall;
    isCaller: boolean;
  }) => {
  
    console.log("Received signal:", data);

    try {
      
      if (!localStream) {
        console.warn("Local stream is missing, waiting for it...");
        return
      }

      
    // Fetch media stream dynamically if missing
        // let stream: MediaStream | null = localStream ;
        // if (!stream) {
        //   console.warn("Local stream is missing, fetching...");
          
        //   stream = await getMediaStream("faceMode", data.ongoingCall.isVoiceCall);
        //   if (!stream) {
        //     console.error("Failed to get local stream");
        //     return;
        //   }
        //   setLocalStream(stream);
        // }

      // If peer exists, just signal
      if (peer?.peerConnection && !peer.peerConnection.destroyed) {
        console.log("Signaling existing peer");
        peer.peerConnection.signal(data.sdp);
        return;
      }

      // Create new peer if we don't have one
      if (!peer?.peerConnection) {
        console.log("Creating new peer in completePeerConnection");
        const newPeer = await createPeer(localStream, false);
        setPeer({
          peerConnection: newPeer,
          participantUser: data.ongoingCall.participants.receiver,
          stream: undefined,
        });

        newPeer.on("signal", (signalData: SignalData) => {
          console.log("New peer signal generated:", signalData);
          if (socket) {
            socket.emit("webrtcSignal", {
              sdp: signalData,
              ongoingCall: data.ongoingCall,
              isCaller: !data.isCaller,
            });
          }
        });

        newPeer.signal(data.sdp);
      }
    } catch (error) {
      console.error("Error in completePeerConnection:", error);
      handleHangup({});
    }
  };

  //online-status
  const checkOnlineStatus = (oppositeUserId: string ) => {
    if(socket && oppositeUserId){  
      socket.emit('checkOnlineStatus', oppositeUserId);
      } 
  };

  //get user id
  const handleStatus =  ( oppositeUserId: string | null): void => {
    if(oppositeUserId){
      setOppositeUserId(oppositeUserId);
    };
    return;
  }

  //initializing a socket
  useEffect(() => {
    const newSocket = connectSocket();
    setSocket(newSocket);

    return () => {
      disconnectSocket();
    };
  }, [user?.id]);

  useEffect(() => {
    if (socket === null) return;

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsSocketConnected(true);
    }

    function onDisconnect() {
      setIsSocketConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  //mapping into backend
  useEffect(() => {
    if (!socket || !isSocketConnected) {
      return;
    }
    socket.emit("register", user);
    socket.emit('deliver', user?.id);
    socket.on("getUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getUsers", (res) => {
        setOnlineUsers(res);
      });
    };
  }, [socket, isSocketConnected, user?.id]);
  
  //calls
  useEffect(() => {
    if (!socket || !isSocketConnected) return;
    socket.on("incomingCall", onIncomingCall);
    socket.on("webrtcSignal", completePeerConnection);
    socket.on("hangup", handleHangup);

    return () => {
      socket.off("incomingCall", onIncomingCall);
      socket.off("webrtcSignal", completePeerConnection);
      socket.off("hangup", handleHangup);
    };
  }, [socket, isSocketConnected, user, onIncomingCall, completePeerConnection]);

  // //autho reject
  useEffect(() => {
    let timeOutInterval: NodeJS.Timeout | null = null; 
    if (connect) {
      timeOutInterval = setTimeout(() => {
        handleHangup({ongoingCall: ongoingCall ? ongoingCall : undefined, isEmitHangUp: true, isMissed: true});
        setConnect(false);
      }, 10000);
    }
    return () => {
      if (timeOutInterval) {
        clearTimeout(timeOutInterval);
      }
    };
  }, [connect]);

  //call timing
  useEffect(() => {
    let intervalRef: ReturnType<typeof setInterval>;
    if(peer?.peerConnection){
      intervalRef = setInterval(() => {
        setCallDuration( prev => prev + 1);
      },1000);
    }
    return () => {
      clearInterval(intervalRef)
    }
  }, [peer?.stream]);


  //chat-receive message
  useEffect(() => {
  if (!socket || !user ) return;
    const handleReceiveMessage = (message: Chats) => {
      setMessages(message);
      if(message.senderProfile?.username && message.senderProfile.image && message.senderProfile._id){
        const currentUrl = searchParams.toString() 
        ? `${pathname}/?${searchParams.toString()}` 
        : pathname;

        const expectedUrl = `/user/chat/?id=${String(message.sender)}`;
        if(currentUrl !== expectedUrl){
          messageToast(message?.senderProfile?.image[0] , message?.senderProfile?.username, message.message, message.sender);
        } 
      }
    };

    const handlePassedMessage = (message: Chats) => {
      setMessages(message);
    }

    const handleReadedMessage = (data: {chatId: string, status: string, isRead: boolean}) => {
      setMessages((prevMessages) => 
        prevMessages ? { ...prevMessages, status: data.status, isRead: true } : prevMessages
      );
    };
    
     socket.on('receiveMessage', handleReceiveMessage);
     socket.on('messageSent', handlePassedMessage);
    socket.on('messageReaded', handleReadedMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageSent', handlePassedMessage);
    socket.off('messageReaded', handleReadedMessage);
    };
  }, [socket, user]);

  //status getter
    useEffect(() => {
      if (!socket || !user || !oppositeUserId) return;
      const handleOnlineStatus = (status: { userId: string; isOnline: boolean }) => {
        if (status.userId === oppositeUserId) {
            setIsOnline(status.isOnline);
        };
      };
       socket.on('onlineStatus', handleOnlineStatus);
       return () => {
        socket.off('onlineStatus', handleOnlineStatus);
      }
    }, [socket, user, oppositeUserId]);
  
  //notification
    useEffect(() => {
      if (!socket) return;
  
       socket.on('newNotification', (data) => {
        notificationToast(data?.image , data?.username, data?.message)
      });
      return () => {
        socket.off('newNotification');
      };
    }, [socket]);

  return (
    <SocketContext2.Provider
      value={{
        onlineUsers,
        ongoingCall,
        localStream,
        peer,
        handleCall,
        handleJoinCall,
        handleHangup,
        isCallEnded,
        isVoiceCall,
        setVoiceCall,
        logoutUser,
        receivedMessage: message,
        checkOnlineStatus,
        handleStatus,
        oppositeUserIsOnline: isOnline,
        callLogHandler,
        socket,
      }}
    >
      {children}
    </SocketContext2.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext2);

  if (context === null) {
    throw new Error("useSocket must be used within a SocketContexProvider");
  }

  return context;
};
