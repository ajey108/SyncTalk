import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { GoDotFill } from "react-icons/go";
import { IoIosSend } from "react-icons/io";
import { GrGallery } from "react-icons/gr";

import { HiOutlineArrowSmLeft, HiOutlineArrowSmRight } from "react-icons/hi";

import API from "../api/axiosInstance";
import cloudinaryAPI from "../api/cloudinaryInstance";
import { useAuth } from "../context/AuthContext";

const ChatBox = ({
  selectedUser,
  toggleLeftSidebar,
  toggleRightSidebar,
  messages,
  setMessages,
}) => {
  const { user, onlineUsers } = useAuth();
  const socketRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);
  const userRef = useRef(user);
  const typingTimeoutRef = useRef(null);

  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // keep refs updated
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // notification sound
  const playNotificationSound = () => {
    try {
      const s = new Audio("/ios_notification.mp3");
      s.play();
    } catch (e) {
      console.log("Notification sound error", e);
    }
  };

  // Initialize socket once
  useEffect(() => {
    socketRef.current = io(
      import.meta.env.VITE_SOCKET_URL ||
        "https://synctalk-backend.onrender.com",
      {
        transports: ["websocket", "polling"],
        withCredentials: true,
        secure: true,
        autoConnect: true,
      }
    );

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connect error:", err?.message || err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // join the user's room
  useEffect(() => {
    if (userRef.current?._id && socketRef.current) {
      socketRef.current.emit("join", userRef.current._id);
    }
  }, [user?._id]);

  // Socket event listeners
  useEffect(() => {
    if (!socketRef.current) return;

    // Handle incoming messages
    const handleReceiveMessage = (newMessage) => {
      // play sound if message is for me
      if (newMessage.receiver === userRef.current?._id) {
        playNotificationSound();
      }

      // Add to messages if it's from or to the selected user
      const su = selectedUserRef.current;
      if (!su) return; // no chat open

      if (newMessage.sender === su._id || newMessage.receiver === su._id) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Mark as seen if the chat is open with the sender
      if (
        newMessage.sender === su._id &&
        newMessage.receiver === userRef.current?._id
      ) {
        socketRef.current.emit("markAsSeen", {
          senderId: newMessage.sender,
          receiverId: newMessage.receiver,
        });
      }
    };

    const handleMessagesSeen = ({ by }) => {
      // just update seen status for messages sent by me to 'by'
      setMessages((prev) =>
        prev.map((msg) =>
          // seen
          msg.sender === userRef.current?._id && msg.receiver === by
            ? { ...msg, seen: true }
            : msg
        )
      );
    };

    // update delivered status
    const handleMessageDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true } : msg
        )
      );
    };

    // Typing indicator
    const handleTyping = ({ from }) => {
      if (selectedUserRef.current && from === selectedUserRef.current._id) {
        setIsTyping(true);
      }
    };

    // Stop typing indicator
    const handleStopTyping = ({ from }) => {
      if (selectedUserRef.current && from === selectedUserRef.current._id) {
        setIsTyping(false);
      }
    };

    // Register event listeners
    socketRef.current.on("receiveMessage", handleReceiveMessage);
    socketRef.current.on("messagesSeen", handleMessagesSeen);
    socketRef.current.on("messageDelivered", handleMessageDelivered);
    socketRef.current.on("typing", handleTyping);
    socketRef.current.on("stopTyping", handleStopTyping);
    socketRef.current.on("getOnlineUsers");

    // Cleanup on unmount
    return () => {
      socketRef.current.off("receiveMessage", handleReceiveMessage);
      socketRef.current.off("messagesSeen", handleMessagesSeen);
      socketRef.current.off("messageDelivered", handleMessageDelivered);
      socketRef.current.off("typing", handleTyping);
      socketRef.current.off("stopTyping", handleStopTyping);
      socketRef.current.off("getOnlineUsers");
    };
  }, []);

  // Fetch messages for the selected chat and mark seen
  useEffect(() => {
    if (!selectedUser || !user?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${user._id}/${selectedUser._id}`);
        setMessages(res.data || []);

        // mark all as seen
        socketRef.current.emit("markAsSeen", {
          senderId: selectedUser._id,
          receiverId: user._id,
        });
      } catch (err) {
        console.error("Fetch messages error", err);
      }
    };

    fetchMessages();
  }, [selectedUser?._id, user?._id, setMessages]);

  // Typing indicator
  useEffect(() => {
    if (!user?._id || !selectedUser?._id || !socketRef.current) return;

    // emit typing event
    if (messageText.trim() !== "") {
      socketRef.current.emit("typing", {
        from: user._id,
        to: selectedUser._id,
      });

      // reset timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("stopTyping", {
          from: user._id,
          to: selectedUser._id,
        });
      }, 1500);
    } else {
      socketRef.current.emit("stopTyping", {
        from: user._id,
        to: selectedUser._id,
      });
    }

    // cleanup on unmount or messageText change
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, user?._id, selectedUser?._id]);

  // Image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() && !selectedImage) return;

    let imageUrl = null;
    if (selectedImage) {
      const fd = new FormData();
      fd.append("file", selectedImage);
      fd.append("upload_preset", "chat_sync");
      try {
        const uploadRes = await cloudinaryAPI.post("/image/upload", fd);
        imageUrl = uploadRes.data.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error", err);
        return;
      }
    }

    //  local message object until backend responds
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      sender: user._id,
      receiver: selectedUser._id,
      text: messageText || "",
      image: imageUrl,
      seen: false,
      delivered: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await API.post("/messages/send", {
        sender: user._id,
        receiver: selectedUser._id,
        text: messageText || "",
        image: imageUrl,
      });

      //  saved message
      const savedMessage = {
        ...res.data,
        seen: res.data.seen || false,
        delivered: true,
      };

      // update the temp message in state
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMessage._id ? savedMessage : m))
      );

      // emit to other user
      socketRef.current.emit("sendMessage", savedMessage);

      // clear input
      setMessageText("");
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  // cleanup typing on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current && user?._id && selectedUser?._id) {
        socketRef.current.emit("stopTyping", {
          from: user._id,
          to: selectedUser._id,
        });
      }
    };
  }, [selectedUser?._id, user?._id]);

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 text-white">
      {!selectedUser ? (
        //  Empty state
        <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400">
          <h2 className="text-2xl font-bold text-white">
            Welcome to SyncTalk 👋
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Select a user to start chatting
          </p>
        </div>
      ) : (
        <>
          {/*  Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-800 shadow-md">
            <div className="flex items-center gap-3">
              <img
                src={selectedUser?.profilePic || "/default-avatar.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border border-zinc-700"
              />
              <div>
                <h3 className="font-semibold text-white">
                  {selectedUser?.username || "User"}
                </h3>
                <div className="text-xs text-gray-400">
                  {isTyping ? (
                    <span className="italic text-green-400">typing...</span>
                  ) : onlineUsers?.includes(selectedUser?._id) ? (
                    <span className="text-green-400 flex items-center gap-1">
                      online{" "}
                      <GoDotFill className="text-green-400 text-[10px]" />
                    </span>
                  ) : (
                    <span className="text-gray-500">offline</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <HiOutlineArrowSmLeft
                onClick={toggleLeftSidebar}
                className="text-xl cursor-pointer hover:text-green-400 transition"
              />
              <HiOutlineArrowSmRight
                onClick={toggleRightSidebar}
                className="text-xl cursor-pointer hover:text-green-400 transition"
              />
            </div>
          </div>

          {/*  Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-zinc-900/90 custom-scrollbar">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${
                    msg.sender === user._id ? "justify-end" : "justify-start"
                  } animate-fadeIn`}
                >
                  {msg.sender !== user._id && (
                    <img
                      src={selectedUser?.profilePic || "/default-avatar.png"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border border-zinc-700"
                    />
                  )}

                  <div
                    className={`p-3 rounded-2xl max-w-[75%] shadow-md ${
                      msg.sender === user._id
                        ? "bg-green-600 text-white rounded-br-none"
                        : "bg-zinc-800 text-zinc-200 rounded-bl-none"
                    }`}
                  >
                    {msg.text && (
                      <p className="text-sm leading-snug">{msg.text}</p>
                    )}
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="sent"
                        className="mt-2 rounded-md w-full max-w-[200px] object-cover"
                      />
                    )}

                    <div className="text-[10px] mt-1 text-right opacity-70 flex items-center justify-end gap-1">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.sender === user._id &&
                        (msg.seen ? (
                          <span className="text-white">seen</span>
                        ) : msg.delivered ? (
                          <span className="text-white">delivered</span>
                        ) : (
                          <span className="text-white">sent</span>
                        ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 mt-10">No messages yet</p>
            )}
          </div>

          {/*  Input area */}
          <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-3 sticky bottom-0">
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-12 h-12 rounded-md object-cover border border-zinc-700"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs hover:bg-red-600"
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // prevent newline or form submission
                  handleSendMessage();
                }
              }}
              className="flex-1 rounded-full bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-green-400 transition"
            />

            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
            <label
              htmlFor="image"
              className="cursor-pointer hover:scale-110 transition"
            >
              <GrGallery className="text-white text-xl" />
            </label>

            <button
              onClick={handleSendMessage}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition"
            >
              <IoIosSend size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;
