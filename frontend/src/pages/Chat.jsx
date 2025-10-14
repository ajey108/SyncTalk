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
    <div className="w-full h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Main layout container */}
      <div className="flex w-full h-full max-w-[1400px] mx-auto">
        {/*  Left Sidebar (Desktop) */}
        <div className="hidden md:flex w-[300px] border-r border-zinc-800 bg-zinc-900 shadow-lg">
          <LeftSidebar setSelectedUser={setSelectedUser} />
        </div>

        {/*  Mobile View: show Sidebar OR Chat */}
        <div className="flex-1 flex flex-col md:hidden h-full">
          {!selectedUser ? (
            <LeftSidebar setSelectedUser={setSelectedUser} />
          ) : (
            <ChatBox
              toggleLeftSidebar={() => setSelectedUser(null)}
              toggleRightSidebar={toggleRightSidebar}
              selectedUser={selectedUser}
              messages={messages}
              setMessages={setMessages}
            />
          )}
        </div>

        {/*  Chat Area (Desktop) */}
        <div className="flex-1 hidden md:flex flex-col bg-zinc-900 border-r border-zinc-800">
          <ChatBox
            toggleRightSidebar={toggleRightSidebar}
            selectedUser={selectedUser}
            messages={messages}
            setMessages={setMessages}
          />
        </div>

        {/*  Right Sidebar (Desktop) */}
        <div className="hidden md:flex w-[300px] bg-zinc-900 border-l border-zinc-800 relative">
          <RightSidebar
            onClose={toggleRightSidebar}
            selectedUser={selectedUser}
            messages={messages}
          />
        </div>

        {/*  Right Sidebar (Mobile) */}
        {isRightSidebarOpen && (
          <div className="fixed top-0 right-0 h-full w-[300px] bg-zinc-900 border-l border-zinc-800 shadow-xl z-50 md:hidden transition-all duration-300">
            <RightSidebar
              onClose={toggleRightSidebar}
              selectedUser={selectedUser}
              messages={messages}
            />
            <button
              className="absolute top-3 left-3 bg-zinc-800 hover:bg-zinc-700 p-2 rounded-full transition"
              onClick={toggleRightSidebar}
            >
              <RxCross2 size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
