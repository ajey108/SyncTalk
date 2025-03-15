import React, { useState } from "react";
import ChatBox from "../components/ChatBox";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);

  const toggleLeftSidebar = () => setLeftSidebarOpen((prev) => !prev);
  const toggleRightSidebar = () => setRightSidebarOpen((prev) => !prev);

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
              className="absolute top-4 right-4 text-black"
              onClick={toggleLeftSidebar}
            >
              ❌
            </button>
          </div>
        )}

        {/* Main Chat Box */}
        <div className="flex-1 bg-gray-500 h-full flex flex-col">
          <ChatBox
            toggleLeftSidebar={toggleLeftSidebar}
            toggleRightSidebar={toggleRightSidebar}
            selectedUser={selectedUser}
          />
        </div>

        {/* Right Sidebar for desktop  */}
        <div className="hidden md:block w-[300px] bg-white shadow-lg relative">
          <RightSidebar onClose={toggleRightSidebar} />
        </div>

        {/* Right Sidebar for mobile  */}
        {isRightSidebarOpen && (
          <div className="fixed top-0 right-0 h-full w-[300px] bg-white shadow-lg z-20 md:hidden">
            <RightSidebar onClose={toggleRightSidebar} />
            <button
              className="absolute top-4 left-4 text-black"
              onClick={toggleRightSidebar}
            >
              ❌
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
