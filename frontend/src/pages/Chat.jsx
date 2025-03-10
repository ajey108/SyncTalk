import React, { useState } from "react";
import ChatBox from "../components/ChatBox";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text   font-bold  h-[100vh] w-full flex items-center justify-center">
      <div className="flex-1 flex gap-1 items-center justify-center">
        <LeftSidebar setSelectedUser={setSelectedUser} />

        <ChatBox selectedUser={selectedUser} />

        <RightSidebar />
      </div>
    </div>
  );
};

export default Chat;
