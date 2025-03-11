"use client";
import { useState, useRef } from "react";
import { X, Send, Trash2, BotMessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ type: "user" | "bot"; content: string }[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const pathName = usePathname();

 if(!pathName.split('/').includes('user')) return;

  /** Function to send messages to the chatbot API */
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { type: "user", content: message }]);
    setUserInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: message }] }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { type: "bot", content: data.response }]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  /** Auto-scroll chat to the latest message */
  // useEffect(() => {
  //   if (chatRef.current) {
  //     chatRef.current.scrollTop = chatRef.current.scrollHeight;
  //   }
  // }, [messages]);

  /** Clear chat history */
  const handleClearChat = () => {
    setMessages([]);
  };

  return (
  <motion.div
    className="fixed bottom-4 right-4 z-50"
    drag
        //  dragConstraints={{ top: -300, left: -300, right: 300, bottom: 300 }} // Prevents dragging too far

    whileDrag={{ scale: 1.05 }}
  >
    {isOpen ? (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400 
                  dark:from-blue-900 dark:via-blue-800 dark:to-blue-700
                  rounded-2xl shadow-xl w-80 h-[500px] flex flex-col 
                  border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-500"
      >
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-800 dark:to-blue-600 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2">
            <BotMessageSquare size={22} />
            <h3 className="font-semibold text-lg">Closer AI</h3>
          </div>
          <div className="flex gap-3">
            <button onClick={handleClearChat} className="text-white hover:text-gray-300 transition">
              <Trash2 size={18} />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-t from-gray-50 via-gray-100 to-gray-200
                    dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 
                    scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 transition-all duration-500"
        >
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm max-w-xs shadow-md ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-br-none"
                    : "bg-gradient-to-r from-gray-300 to-gray-200 text-black dark:from-gray-600 dark:to-gray-500 dark:text-white rounded-bl-none"
                }`}
              >
                {message.content}
              </span>
            </motion.div>
          ))}
          {isTyping && <div className="text-gray-500 text-sm italic dark:text-gray-300">Bot is typing...</div>}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t bg-gradient-to-r from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center transition-all duration-500">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-600 dark:text-white dark:border-gray-500 transition-all duration-500"
            onKeyDown={(e) => e.key === "Enter" && sendMessage(userInput)}
          />
          <button
            onClick={() => sendMessage(userInput)}
            className="ml-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-2 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-500"
          >
            <Send size={20} />
          </button>
        </div>
      </motion.div>
    ) : (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full p-4 shadow-xl hover:from-blue-700 hover:to-blue-600 transition-transform transform hover:scale-105 dark:from-blue-800 dark:to-blue-700 dark:hover:from-blue-900 dark:hover:to-blue-800"
      >
        <BotMessageSquare size={28} />
      </motion.button>
    )}
  </motion.div>
  );
};

export default ChatBot;



// "use client";

// import { useState } from "react";
// import { RootState } from "@/store";
// import { useSelector } from "react-redux";
// import { X, Send } from "lucide-react";

// const ChatBot = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<{ type: "user" | "bot"; content: string }[]>([]);
//   const [userInput, setUserInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const role = useSelector((state: RootState) => state.user.userInfo?.role);

//   /** Function to send messages to the chatbot API */
//   const sendMessage = async (message: string) => {
//     if (!message.trim()) return;

//     // Add user message to chat
//     setMessages((prev) => [...prev, { type: "user", content: message }]);
//     setUserInput("");
//     setIsTyping(true);

//     try {
//       const response = await fetch("/api/bot", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ messages: [...messages, { role: "user", content: message }] }),
//       });

//       const data = await response.json();
//       setMessages((prev) => [...prev, { type: "bot", content: data.response }]);
//     } catch (error) {
//       console.error("Error fetching chatbot response:", error);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   return (
//     <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-300 shadow-lg rounded-lg">
//       {/* Chat Header */}
//       <div className="flex justify-between items-center p-3 bg-blue-500 text-white rounded-t-lg">
//         <h3 className="text-lg font-bold">ChatBot</h3>
//         <X className="cursor-pointer" onClick={() => setIsOpen(false)} />
//       </div>

//       {/* Chat Messages */}
//       <div className="p-3 h-64 overflow-y-auto">
//         {messages.map((m, index) => (
//           <div key={index} className={`mb-2 ${m.type === "user" ? "text-right" : "text-left"}`}>
//             <span
//               className={`inline-block p-2 rounded-md ${
//                 m.type === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
//               }`}
//             >
//               {m.content}
//             </span>
//           </div>
//         ))}
//         {isTyping && <div className="text-gray-400">Bot is typing...</div>}
//       </div>

//       {/* Chat Input */}
//       <div className="p-3 flex items-center border-t">
//         <input
//           type="text"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage(userInput)}
//           placeholder="Type a message..."
//           className="flex-1 p-2 border rounded-md"
//         />
//         <Send className="ml-2 cursor-pointer text-blue-500" onClick={() => sendMessage(userInput)} />
//       </div>
//     </div>
//   );
// };

// export default ChatBot;


