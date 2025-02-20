import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { GoDotFill } from "react-icons/go";
import { IoIosSend } from "react-icons/io";
import { GrGallery } from "react-icons/gr";
import { IoHelpCircleOutline } from "react-icons/io5";
import API from "../api/axiosInstance";

const socket = io("http://localhost:5000");

const ChatBox = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (!selectedUser) return;

    // Fetch messages between the selected user and the current user
    const fetchMessages = async () => {
      if (!selectedUser) return;

      try {
        const res = await API.get(
          `/messages/${currentUser._id}/${selectedUser._id}`
        );
        setMessages(res.data);
      } catch (error) {
        console.error(
          "Error fetching messages:",
          error.response?.data || error.message
        );
      }
    };
    fetchMessages();

    // Listen for incoming messages
    socket.on("receiveMessage", (newMessage) => {
      if (
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [selectedUser]);

  console.log("selected user is", selectedUser);

  // Send message to the server
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const newMessage = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await API.post("/messages/send", newMessage); // Send message

      setMessages((prev) => [...prev, res.data]); //  Use response data
      socket.emit("sendMessage", res.data); // Emit message to socket
      setMessageText("");
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="h-screen w-1/2 bg-white shadow-lg rounded-lg flex flex-col">
      {/* 🔹 Chat Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-100">
        <div className="flex items-center gap-3">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={selectedUser?.avatar || "/default-avatar.png"}
            alt="User Avatar"
          />
          <div>
            <p className="text-lg font-semibold">
              {selectedUser?.username || "User"}
            </p>
            <p className="text-sm text-green-500 flex items-center gap-1">
              <GoDotFill className="text-green-500" /> Online
            </p>
          </div>
        </div>
        <IoHelpCircleOutline className="text-xl cursor-pointer text-gray-600 hover:text-gray-900 transition duration-200" />
      </div>

      {/* 🔹 Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.senderId === currentUser._id
                ? "justify-end"
                : "items-start gap-3"
            }`}
          >
            {msg.senderId !== currentUser._id && (
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={selectedUser?.avatar || "/default-avatar.png"}
                alt="User Avatar"
              />
            )}
            <div
              className={`${
                msg.senderId === currentUser._id
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-800"
              } rounded-lg p-3 max-w-xs shadow-md`}
            >
              <p>{msg.message}</p>
              <div className="text-xs mt-1 opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Message Input Box */}
      <div className="p-4 bg-white border-t flex items-center gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-green-400"
        />
        <input type="file" id="image" accept="image/png, image/jpeg" hidden />
        <label
          htmlFor="image"
          className="cursor-pointer text-gray-600 hover:text-gray-900 transition duration-200"
        >
          <GrGallery className="text-2xl" />
        </label>
        <button
          onClick={handleSendMessage}
          className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition duration-200"
        >
          <IoIosSend className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
