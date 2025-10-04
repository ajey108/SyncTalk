import React, { useState } from "react";
import ChatBox from "../components/ChatBox";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import { RxCross2 } from "react-icons/rx";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);

  const toggleRightSidebar = () => setRightSidebarOpen((prev) => !prev);

  return (
    <div className="w-full h-screen">
      <div className="flex justify-center w-full h-full">
        {/* Left Sidebar for desktop */}
        <div className="hidden md:block w-[300px] shadow-lg">
          <LeftSidebar setSelectedUser={setSelectedUser} />
        </div>

        {/* Mobile View: show LeftSidebar first, then ChatBox if user selected */}
        <div className="flex-1 bg-gray-500  h-full flex flex-col md:hidden">
          {!selectedUser ? (
            <LeftSidebar setSelectedUser={setSelectedUser} />
          ) : (
            <ChatBox
              toggleLeftSidebar={() => setSelectedUser(null)} // go back
              toggleRightSidebar={toggleRightSidebar}
              selectedUser={selectedUser}
              messages={messages}
              setMessages={setMessages}
            />
          )}
        </div>

        {/* Main ChatBox for desktop */}
        <div className="flex-1 bg-gray-500 h-full flex-col hidden md:flex">
          <ChatBox
            toggleRightSidebar={toggleRightSidebar}
            selectedUser={selectedUser}
            messages={messages}
            setMessages={setMessages}
          />
        </div>

        {/* Right Sidebar for desktop */}
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
              selectedUser={selectedUser}
              messages={messages}
            />
            <button
              className="absolute top-4 left-4 text-white"
              onClick={toggleRightSidebar}
            >
              <RxCross2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
