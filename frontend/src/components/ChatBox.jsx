import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { IoIosSend } from "react-icons/io";
import { GrGallery } from "react-icons/gr";
import { IoHelpCircleOutline } from "react-icons/io5";
import { HiOutlineArrowSmLeft } from "react-icons/hi";
import { HiOutlineArrowSmRight } from "react-icons/hi";

import API from "../api/axiosInstance";
import cloudinaryAPI from "../api/cloudinaryInstance";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:5000");

const ChatBox = ({
  selectedUser,
  toggleLeftSidebar,
  toggleRightSidebar,
  messages,
  setMessages,
}) => {
  const { user } = useAuth();

  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  console.log("selectedUser", selectedUser);
  console.log("messages in chatbox are", messages);

  const [imagePreview, setImagePreview] = useState(null);
  console.log("Selected Image:", selectedImage);

  // notification sound
  const notificationSound = new Audio("/ios_notification.mp3");
  notificationSound.load();

  useEffect(() => {
    if (user?._id) {
      //If user exists and has a valid _id, join their room
      socket.emit("join", user._id);
      console.log(`User ${user._id} joined their room`);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedUser || !user?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${user._id}/${selectedUser._id}`);
        setMessages(res.data);
      } catch (error) {
        console.error(
          "Error fetching messages:",
          error.response?.data || error.message
        );
      }
    };

    fetchMessages();

    //Listen for Incoming Messages
    const handleNewMessage = (newMessage) => {
      if (
        newMessage.sender === selectedUser._id ||
        newMessage.receiver === selectedUser._id
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        notificationSound.play(); // Play notification sound
      }
    };

    socket.on("receiveMessage", handleNewMessage);

    // Clean up function to remove event listener
    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, [selectedUser, user?._id]);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); // Generate preview URL
    }
  };

  // Send message with text and/or image
  const handleSendMessage = async () => {
    if (!messageText.trim() && !selectedImage) return;

    let imageUrl = null;

    // Upload image to Cloudinary
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("upload_preset", "chat_sync"); // Cloudinary Upload Preset

      try {
        const uploadRes = await cloudinaryAPI.post("/image/upload", formData);
        imageUrl = uploadRes.data.secure_url; // Get image URL
        console.log("Image uploaded to Cloudinary:", imageUrl);
      } catch (error) {
        console.error(
          "Error uploading image:",
          error.response?.data || error.message
        );
        return; // Stop execution if image upload fails
      }
    }

    //  send  the image URL and msg
    const newMessage = {
      sender: user._id,
      receiver: selectedUser._id,
      text: messageText || "",
      image: imageUrl, // Only the URL
    };

    try {
      const res = await API.post("/messages/send", newMessage);
      setMessages((prev) => [...prev, { ...newMessage, ...res.data }]);
      socket.emit("sendMessage", res.data);
      setMessageText("");
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="flex w-full h-full overflow-x-hidden overflow-y-hidden md:overflow-y-auto">
      {/* Check if a user is selected */}
      {!selectedUser ? (
        <div className="flex flex-col items-center justify-center text-white flex-1 bg-zinc-900 text-center">
          <h1 className="text-2xl md:text-4xl font-bold">
            Welcome to SyncTalk!
          </h1>
          <p className="text-sm md:text-base  mt-2">
            Select a user from the sidebar to start chatting.
          </p>
        </div>
      ) : (
        <div className="flex flex-col bg-gray-400 flex-1">
          {/* Chat Header */}
          <div className="flex justify-between items-center p-3 md:p-4 border-b bg-zinc-900 text-white">
            <div className="flex items-center gap-2 md:gap-3">
              <img
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                src={selectedUser?.profilePic || "/default-avatar.png"}
                alt="User Avatar"
              />
              <div className="text-xs md:text-base relative group cursor-pointer">
                <p className="text-sm md:text-lg font-semibold">
                  {selectedUser?.username || "User"}
                </p>
                <p className="md:text-lg font-extralight w-[200px] absolute left-0 -bottom-8 bg-gray-700 text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {selectedUser?.status || "a SyncTalk user"}
                </p>
              </div>
            </div>

            {/* Toggle buttons visible only on mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <HiOutlineArrowSmLeft
                onClick={toggleLeftSidebar}
                className="cursor-pointer text-white text-xl"
              />
              <HiOutlineArrowSmRight
                onClick={toggleRightSidebar}
                className="cursor-pointer text-white text-xl"
              />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <IoHelpCircleOutline className="text-xl cursor-pointer text-gray-600 hover:text-gray-900 transition duration-200" />
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-2 md:p-4 space-y-3 overflow-y-auto bg-zinc-900">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === user._id
                    ? "justify-end"
                    : "items-start gap-2 md:gap-3"
                }`}
              >
                {msg.sender !== user._id && (
                  <img
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
                    src={selectedUser?.profilePic || "/default-avatar.png"}
                    alt="User Avatar"
                  />
                )}

                <div
                  className={`${
                    msg.sender === user._id
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  } rounded-lg p-2 md:p-3 max-w-[70%] md:max-w-xs shadow-md break-words`}
                >
                  {msg.text && (
                    <p className="text-sm md:text-base">{msg.text}</p>
                  )}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Sent"
                      className="mt-2 rounded-lg max-w-[200px] md:max-w-xs"
                    />
                  )}
                  <div className="text-[10px] md:text-xs mt-1 opacity-75 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-2 md:p-4 bg-zinc-900 text-white flex items-center gap-2 md:gap-3">
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-12 h-12 md:w-16 md:h-16 rounded-md object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 py-0.5 text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 border rounded-full px-3 py-1.5 md:px-4 md:py-2 outline-none focus:ring-2 focus:ring-green-400 text-sm md:text-base"
            />

            <input
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              hidden
              onChange={handleImageChange}
            />

            <label
              htmlFor="image"
              className="cursor-pointer text-gray-600 hover:text-gray-900 transition duration-200"
            >
              <GrGallery className="text-xl md:text-2xl" />
            </label>

            <button
              onClick={handleSendMessage}
              className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 transition duration-200"
            >
              <IoIosSend className="text-xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
