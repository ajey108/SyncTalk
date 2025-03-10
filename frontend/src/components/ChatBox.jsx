import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { GoDotFill } from "react-icons/go";
import { IoIosSend } from "react-icons/io";
import { GrGallery } from "react-icons/gr";
import { IoHelpCircleOutline } from "react-icons/io5";
import API from "../api/axiosInstance";
import cloudinaryAPI from "../api/cloudinaryInstance";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:5000");

const ChatBox = ({ selectedUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  console.log("selectedUser", selectedUser);

  const [imagePreview, setImagePreview] = useState(null);
  console.log("Selected Image:", selectedImage);

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

    // Upload image to Cloudinary using axios instance
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("upload_preset", "chat_preset"); // Ensure correct preset

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
    <div className="h-[80vh] w-1/2 bg-white shadow-lg rounded-lg flex flex-col">
      {/* 🔹 Chat Header */}
      <div className="flex  p-4 border-b bg-gray-100">
        <div className="flex items-center gap-3">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={selectedUser?.profilePic || "/default-avatar.png"}
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
              msg.sender === user._id ? "justify-end" : "items-start gap-3"
            }`}
          >
            {msg.sender !== user._id && (
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={selectedUser?.profilePic || "/default-avatar.png"}
                alt="User Avatar"
              />
            )}
            <div
              className={`${
                msg.sender === user._id
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-800"
              } rounded-lg p-3 max-w-xs shadow-md`}
            >
              {msg.text && <p>{msg.text}</p>}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Sent"
                  className="mt-2 rounded-lg max-w-xs"
                />
              )}
              <div className="text-xs mt-1 opacity-75">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Message Input Box */}
      <div className="p-4 bg-white border-t flex items-center gap-3">
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 rounded-md object-cover"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
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
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-green-400"
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
