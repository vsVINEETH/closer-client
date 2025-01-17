'use client';

import { useSocket } from '@/context/SocketContext';
import { useEffect, useRef, useState } from 'react';

const configuration = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
  ],
};

export const useWebRTC = () => {
  const { socket } = useSocket();
  const [isCallActive, setIsCallActive] = useState(false);
  const [callerId, setCallerId] = useState<string | null>(null);
  const [recipientId, setRecipienId] = useState <string | null>(null);
  const [isCallIncoming, setIsCallIncoming] = useState(false);

  // Refs for non-UI values
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);


  const createPeerConnection = async () => {
    if (peerConnectionRef.current) return; // Prevent duplicate connections
    try {
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Add local stream tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          console.log('Adding local track:', track);
          if(localStreamRef.current)
           pc.addTrack(track, localStreamRef.current);
           console.log('added local track', track.kind)
        });
      }


      // Handle incoming remote stream
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          console.log('Remote stream added:', event.streams[0].id);
          remoteStreamRef.current = event.streams[0];
        } else {
          console.warn('No streams in ontrack event:', event);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          const targetId =  recipientId || callerId;
          if (targetId) {
            socket.emit('ice-candidate', {
              candidate: event.candidate,
              recipientId: targetId
            });
          }
        }
      };

    } catch (error) {
      console.error('Failed to create RTCPeerConnection:', error);
    }
  };

  const startLocalStream = async () => {
    if (localStreamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      console.log('Local stream started:', stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const initiateCall = async (recipientId: string) => {
    if (!socket) return;
    
    setRecipienId(recipientId);
    await createPeerConnection();
    try {
      const offer = await peerConnectionRef.current?.createOffer();
      if (!offer) throw new Error('Failed to create offer');
      await peerConnectionRef.current?.setLocalDescription(offer);
      socket.emit('offer', { offer, recipientId });
      setIsCallActive(true);
      console.log('Offer sent:', offer);
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  const createOffer = async (data: { offer: RTCSessionDescriptionInit; senderId: string }) => {
    if (!socket) return;

    console.log('Received offer. Signaling state:', peerConnectionRef.current?.signalingState);

    setCallerId(data.senderId);
    setIsCallIncoming(true);

    await startLocalStream();
    await createPeerConnection();

    try {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
      console.log('Remote offer set successfully.');

    // if (peerConnectionRef.current?.signalingState === 'have-remote-offer') {}
        const answer = await peerConnectionRef.current?.createAnswer();
        await peerConnectionRef.current?.setLocalDescription(answer);
        socket.emit('answer', { answer, recipientId: data.senderId });

        console.log('Answer sent:', answer);
        setIsCallActive(true);
        setIsCallIncoming(false);
      
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  // const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
  //   try {
  //     if (peerConnectionRef.current?.signalingState === 'have-local-offer') {
  //       await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  //       console.log('Answer received and set successfully.');
  //     } else {
  //       console.warn('Unexpected signaling state:', peerConnectionRef.current?.signalingState);
  //     }
  //   } catch (error) {
  //     console.error('Error handling answer:', error);
  //   }
  // };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      if (!peerConnectionRef.current) return;
      console.log('Received answer. Signaling state:', peerConnectionRef.current.signalingState);
      
      // if (peerConnectionRef.current.signalingState !== 'stable') {}
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Answer set successfully');
      
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleNewICECandidateMsg = async (candidate: RTCIceCandidateInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('Added ICE candidate:', candidate);
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const endCall = () => {
    try {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      setIsCallActive(false);
      setCallerId(null);
      setIsCallIncoming(false);
      console.log('Call ended.');
    } catch (error) {
      console.error('Error during call cleanup:', error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('offer', createOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleNewICECandidateMsg);

    return () => {
      socket.off('offer', createOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleNewICECandidateMsg);
    };
  }, [socket]);

  return {
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    isCallActive,
    isCallIncoming,
    callerId,
    startLocalStream,
    initiateCall,
    endCall,
  };
};


//v3
// 'use client';

// import { useSocket } from '@/context/SocketContext';
// import { useEffect, useRef, useState } from 'react';

// const configuration = {
//   iceServers: [
//     { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']},
    
//   ],
// };

// export const useWebRTC = () => {
//   const { socket } = useSocket();
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [callerId, setCallerId] = useState<string | null>(null);
//   const [isCallIncoming, setIsCallIncoming] = useState(false);

//   const peerConnection = useRef<RTCPeerConnection | null>(null);

//   const createPeerConnection = async () => {
//     if (peerConnection.current) return; // Prevent duplicate connections
//     try {
//       const pc = new RTCPeerConnection(configuration);
//       peerConnection.current = pc;

//       // Add local stream tracks to the connection
//       if (localStream) {
//         localStream.getTracks().forEach((track) => {
//           console.log('Adding local track:', track);
//           pc.addTrack(track, localStream);
//         });
//       }

//       // Handle ICE candidates
//       pc.onicecandidate = (event) => {
//         if (event.candidate && socket) {
//           socket.emit('ice-candidate', event.candidate);
//           console.log('Sent ICE candidate:', event.candidate);
//         }
//       };

//       // Handle incoming remote stream
//       pc.ontrack = (event) => {
//         if (event.streams && event.streams[0]) {
//           console.log('Remote stream added:', event.streams[0]);
//           setRemoteStream(event.streams[0]);
//         } else {
//           console.warn('No streams in ontrack event:', event);
//         }
//       };

//     } catch (error) {
//       console.error('Failed to create RTCPeerConnection:', error);
//     }
//   };

//   const startLocalStream = async () => {
//     if (localStream) return;
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       setLocalStream(stream);
//       console.log('Local stream started:', stream);
//     } catch (error) {
//       console.error('Error accessing media devices:', error);
//     }
//   };

//   const initiateCall = async (recipientId: string) => {
//     if (!socket) return;
//     await createPeerConnection();
//     try {
//       const offer = await peerConnection.current?.createOffer();
//       if (!offer) throw new Error('Failed to create offer');
//       await peerConnection.current?.setLocalDescription(offer);
//       socket.emit('offer', { offer, recipientId });
//       setIsCallActive(true);
//       console.log('Offer sent:', offer);
//     } catch (error) {
//       console.error('Error initiating call:', error);
//     }
//   };

//   const handleOffer = async (data: { offer: RTCSessionDescriptionInit; senderId: string }) => {
//     if (!socket) return;

//     setCallerId(data.senderId);
//     setIsCallIncoming(true);

//     await createPeerConnection();

//     try {
//       await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
//       console.log('Remote offer set successfully.');

//       if (peerConnection.current?.signalingState === 'have-remote-offer') {
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         socket.emit('answer', { answer, recipientId: data.senderId });
//         console.log('Answer sent:', answer);
//         setIsCallActive(true);
//         setIsCallIncoming(false);
//       }
//     } catch (error) {
//       console.error('Error handling offer:', error);
//     }
//   };

//   const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
//     try {
//       if (peerConnection.current?.signalingState === 'have-local-offer') {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//         console.log('Answer received and set successfully.');
//       } else {
//         console.warn('Unexpected signaling state:', peerConnection.current?.signalingState);
//       }
//     } catch (error) {
//       console.error('Error handling answer:', error);
//     }
//   };

//   const handleNewICECandidateMsg = async (candidate: RTCIceCandidateInit) => {
//     try {
//       if (peerConnection.current) {
//         await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         console.log('Added ICE candidate:', candidate);
//       }
//     } catch (error) {
//       console.error('Error adding ICE candidate:', error);
//     }
//   };

//   const endCall = () => {
//     try {
//       if (peerConnection.current) {
//         peerConnection.current.ontrack = null;
//         peerConnection.current.onicecandidate = null;
//         peerConnection.current.close();
//         peerConnection.current = null;
//       }
//       localStream?.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//       setRemoteStream(null);
//       setIsCallActive(false);
//       setCallerId(null);
//       setIsCallIncoming(false);
//       console.log('Call ended.');
//     } catch (error) {
//       console.error('Error during call cleanup:', error);
//     }
//   };

//   useEffect(() => {
//     if (!socket) return;

//     socket.on('offer', handleOffer);
//     socket.on('answer', handleAnswer);
//     socket.on('ice-candidate', handleNewICECandidateMsg);

//     return () => {
//       socket.off('offer', handleOffer);
//       socket.off('answer', handleAnswer);
//       socket.off('ice-candidate', handleNewICECandidateMsg);
//     };
//   }, [socket]);

//   return {
//     localStream,
//     remoteStream,
//     isCallActive,
//     isCallIncoming,
//     callerId,
//     startLocalStream,
//     initiateCall,
//     endCall,
//   };
// };


//v2
// 'use client';

// import { useSocket } from '@/context/SocketContext';
// import { useEffect, useRef, useState } from 'react';

// const configuration = {
//   iceServers: [
//     { urls: 'stun:stun.l.google.com:19302' },
//     { urls: 'stun:global.stun.twilio.com:3478' },
//   ],
// };

// export const useWebRTC = () => {
//   const { socket } = useSocket();
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [callerId, setCallerId] = useState<string | null>(null);
//   const [isCallIncoming, setIsCallIncoming] = useState(false);

//   const peerConnection = useRef<RTCPeerConnection | null>(null);

//   const createPeerConnection = async () => {
//     if (peerConnection.current) return; // Ensure only one connection exists
//     try {
//       const pc = new RTCPeerConnection(configuration);
//       peerConnection.current = pc;

//       pc.onicecandidate = (event) => {
//         if (event.candidate && socket) {
//           socket.emit('ice-candidate', event.candidate);
//           console.log('Sent ICE candidate:', event.candidate);
//         }
//       };

//       pc.ontrack = (event) => {
//         if (event.streams && event.streams[0]) {
//           setRemoteStream(event.streams[0]);
//         }
//       };

//       if (localStream) {
//         localStream.getTracks().forEach((track) => {
//           pc.addTrack(track, localStream);
//         });
//       }
//     } catch (error) {
//       console.error('Failed to create RTCPeerConnection:', error);
//     }
//   };

//   const startLocalStream = async () => {
//     if (localStream) return;
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       setLocalStream(stream);
//     } catch (error) {
//       console.error('Error accessing media devices:', error);
//     }
//   };

//   const initiateCall = async (recipientId: string) => {
//     if (!socket) return;
//     await createPeerConnection();
//     try {
//       const offer = await peerConnection.current?.createOffer();
//       if (!offer) throw new Error('Failed to create offer');
//       await peerConnection.current?.setLocalDescription(offer);
//       socket.emit('offer', { offer, recipientId });
//       setIsCallActive(true);
//       console.log('Offer sent:', offer);
//     } catch (error) {
//       console.error('Error initiating call:', error);
//     }
//   };

//   const handleOffer = async (data: { offer: RTCSessionDescriptionInit; senderId: string }) => {
//     if (!socket) return;

//     setCallerId(data.senderId);
//     setIsCallIncoming(true);

//     if (!peerConnection.current) {
//       await createPeerConnection();
//     }

//     try {
//       await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
//       console.log('Remote offer set successfully.');

//       if (peerConnection.current?.signalingState === 'have-remote-offer') {
//         const answer = await peerConnection.current.createAnswer();
//         await peerConnection.current.setLocalDescription(answer);
//         socket.emit('answer', { answer, recipientId: data.senderId });
//         console.log('Answer sent:', answer);
//         setIsCallActive(true);
//         // setIsCallIncoming(false);
//       }
//     } catch (error) {
//       console.error('Error handling offer:', error);
//     }
//   };

//   const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
//     try {
//       console.log('here')
//       if (peerConnection.current?.signalingState === 'have-remote-offer') {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//         console.log('Answer received and set successfully.');
//       }
//     } catch (error) {
//       console.error('Error handling answer:', error);
//     }
//   };

//   const handleNewICECandidateMsg = async (candidate: RTCIceCandidateInit) => {
//     try {
//       await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
//       console.log('Added ICE candidate:', candidate);
//     } catch (error) {
//       console.error('Error adding ICE candidate:', error);
//     }
//   };


//   const endCall = () => {
//     try {
//       if (peerConnection.current) {
//         peerConnection.current.ontrack = null;
//         peerConnection.current.onicecandidate = null;
//         peerConnection.current.close();
//         peerConnection.current = null;
//       }
//       localStream?.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//       setRemoteStream(null);
//       setIsCallActive(false);
//       setCallerId(null);
//       setIsCallIncoming(false);
//     } catch (error) {
//       console.error('Error during call cleanup:', error);
//     }
//   };

//   useEffect(() => {
//     if (!socket) return;

//     socket.on('offer', handleOffer);
//     socket.on('answer', handleAnswer);
//     socket.on('ice-candidate', handleNewICECandidateMsg);

//     return () => {
//       socket.off('offer', handleOffer);
//       socket.off('answer', handleAnswer);
//       socket.off('ice-candidate', handleNewICECandidateMsg);
//     };
//   }, [socket]);

//   return {
//     localStream,
//     remoteStream,
//     isCallActive,
//     isCallIncoming,
//     callerId,
//     handleAnswer,
//     startLocalStream,
//     initiateCall,
//     endCall,
//   };
// };




//v1
// 'use client';

// import { useSocket } from '@/context/SocketContext';
// import { useEffect, useRef, useState } from 'react';

// const configuration = {
//   iceServers: [
//     { urls: 'stun:stun.l.google.com:19302' },
//     { urls: 'stun:global.stun.twilio.com:3478' },
//   ],
// };

// export const useWebRTC = () => {
//   const { socket } = useSocket();
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [isCallActive, setIsCallActive] = useState(false);
//   const [callerId, setCallerId] = useState<string | null>(null);
//   const [isCallIncoming, setIsCallIncoming] = useState(false);

//   const peerConnection = useRef<RTCPeerConnection | null>(null);

//   const createPeerConnection = async () => {
//     try {
//       const pc = new RTCPeerConnection(configuration);
//       peerConnection.current = pc;

//       pc.onicecandidate = (event) => {
//         if (event.candidate && socket) {
//           socket.emit('ice-candidate', event.candidate);
//           console.log('Sent ICE candidate:', event.candidate);
//         }
//       };

//       pc.ontrack = (event) => {
//         if (event.streams && event.streams[0]) {
//           setRemoteStream(event.streams[0]);
//         }
//       };

//       if (localStream) {
//         localStream.getTracks().forEach((track) => {
//           pc.addTrack(track, localStream);
//         });
//       }
//     } catch (error) {
//       console.error('Failed to create RTCPeerConnection:', error);
//     }
//   };

//   const startLocalStream = async () => {
//     if (localStream) return;
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       setLocalStream(stream);
//     } catch (error) {
//       console.error('Error accessing media devices:', error);
//     }
//   };

//   const initiateCall = async (recipientId: string) => {
//     if (!socket) return;
//     await createPeerConnection();
//     try {
//       const offer = await peerConnection.current?.createOffer();
//       await peerConnection.current?.setLocalDescription(offer);
//       socket.emit('offer', { offer, recipientId });
//       setIsCallActive(true);
//       console.log('Offer sent:', offer);
//     } catch (error) {
//       console.error('Error initiating call:', error);
//     }
//   };

//   const handleOffer = async (data: { offer: RTCSessionDescriptionInit; senderId: string }) => {
//     if (!socket) return;
//     setCallerId(data.senderId);
//     setIsCallIncoming(true);
//           // Ensure peer connection is created only once
//       if (!peerConnection.current) {
//         await createPeerConnection();
//       }
//     try {
//       await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
//       const answer = await peerConnection.current?.createAnswer();
//       await peerConnection.current?.setLocalDescription(answer);
//       socket.emit('answer', { answer, recipientId: data.senderId });
//       console.log('Answer sent:', answer);
//       setIsCallActive(true);
//     } catch (error) {
//       console.error('Error handling offer:', error);
//     }
//   };

//   const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
//     try {
//       if (peerConnection.current?.signalingState === 'have-local-offer') {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//         console.log('Answer received and set successfully.');
//       }
//     } catch (error) {
//       console.error('Error handling answer:', error);
//     }
//   };

//   const handleNewICECandidateMsg = async (candidate: RTCIceCandidateInit) => {
//     try {
//       await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
//       console.log('Added ICE candidate:', candidate);
//     } catch (error) {
//       console.error('Error adding ICE candidate:', error);
//     }
//   };

//   const answerCall = async () => {
//     if (!socket || !callerId || !peerConnection.current) return;
  
//     try {
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       socket.emit('answer', { answer, recipientId: callerId });
//       setIsCallActive(true);
//       setIsCallIncoming(false);
//       console.log('Answer created and sent:', answer);
//     } catch (error) {
//       console.error('Error creating/sending answer:', error);
//     }
//   };
  

//   const endCall = () => {
//     try {
//       if (peerConnection.current) {
//         peerConnection.current.ontrack = null;
//         peerConnection.current.onicecandidate = null;
//         peerConnection.current.close();
//         peerConnection.current = null;
//       }
//       localStream?.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//       setRemoteStream(null);
//       setIsCallActive(false);
//       setCallerId(null);
//       setIsCallIncoming(false);
//     } catch (error) {
//       console.error('Error during call cleanup:', error);
//     }
//   };

//   useEffect(() => {
//     if (!socket) return;

//     socket.on('offer', handleOffer);
//     socket.on('answer', handleAnswer);
//     socket.on('ice-candidate', handleNewICECandidateMsg);

//     return () => {
//       socket.off('offer', handleOffer);
//       socket.off('answer', handleAnswer);
//       socket.off('ice-candidate', handleNewICECandidateMsg);
//     };
//   }, [socket]);

//   return {
//     localStream,
//     remoteStream,
//     isCallActive,
//     isCallIncoming,
//     callerId,
//     answerCall,
//     startLocalStream,
//     initiateCall,
//     endCall,
//   };
// };


