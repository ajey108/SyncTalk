import React, { useState } from "react";
import ChatBox from "../components/ChatBox";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="bg-blue-500 h-full flex">
      <LeftSidebar setSelectedUser={setSelectedUser} />

      <ChatBox selectedUser={selectedUser} />

      <RightSidebar />
    </div>
  );
};

export default Chat;
