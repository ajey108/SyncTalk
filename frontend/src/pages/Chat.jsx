import React, { useState } from "react";
import ChatBox from "../components/ChatBox";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import { RxCross2 } from "react-icons/rx";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);

  const toggleLeftSidebar = () => setLeftSidebarOpen((prev) => !prev);
  const toggleRightSidebar = () => setRightSidebarOpen((prev) => !prev);

  console.log("Messages in Chat.jsx:", messages);

  return (
    <div className="w-full h-screen">
      <div className="flex  justify-center w-full h-full">
        {/* Left Sidebar for desktop  */}
        <div className="hidden md:block w-[300px] bg-white shadow-lg">
          <LeftSidebar setSelectedUser={setSelectedUser} />
        </div>

        {/* Left Sidebar for mobile */}
        {isLeftSidebarOpen && (
          <div className="fixed top-0 left-0 h-full w-[300px] bg-white shadow-lg z-20 md:hidden">
            <LeftSidebar setSelectedUser={setSelectedUser} />
            <button
              className="absolute top-4 right-0 text-white"
              onClick={toggleLeftSidebar}
            >
              <RxCross2 />
            </button>
          </div>
        )}

        {/* Main Chat Box */}
        <div className="flex-1 bg-gray-500 h-full flex flex-col">
          <ChatBox
            toggleLeftSidebar={toggleLeftSidebar}
            toggleRightSidebar={toggleRightSidebar}
            selectedUser={selectedUser}
            messages={messages}
            setMessages={setMessages}
          />
        </div>

        {/* Right Sidebar for desktop  */}
        <div className="hidden md:block w-[300px] bg-white shadow-lg relative">
          <RightSidebar
            onClose={toggleRightSidebar}
            selectedUser={selectedUser}
            messages={messages}
          />
        </div>

        {/* Right Sidebar for mobile */}
        {isRightSidebarOpen && (
          <div className="fixed top-0 right-0 h-full w-[300px] bg-white shadow-lg z-20 md:hidden">
            <RightSidebar
              onClose={toggleRightSidebar}
              selectedUser={selectedUser} // Pass selectedUser
              messages={messages} // Pass messages
            />
            <button
              className="absolute top-4 left-4 text-white"
              onClick={toggleRightSidebar}
            >
              <RxCross2 />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
