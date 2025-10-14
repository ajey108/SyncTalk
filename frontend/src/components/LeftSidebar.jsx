import React, { useState, useEffect } from "react";
import { SlUser } from "react-icons/sl";
import { CiSearch } from "react-icons/ci";
import { IoChatboxEllipses } from "react-icons/io5";
import API from "../api/axiosInstance";
import { toast } from "react-toastify";

const LeftSidebar = ({ setSelectedUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  console.log("users in leftsidebar", users);

  // Get users for leftsidebar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);
  // search filter
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );
  console.log("Filtered users:", filteredUsers);
  console.log("Rendering LeftSidebar with users:", users.length);
  console.log("First user:", users[0]);
  console.log("Last user:", users[users.length - 1]);

  //profile
  const handleProfile = () => {
    window.location.href = "/profile";
  };

  //logout
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      toast.success("Logged out successfully");
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } catch (err) {
      console.error("Error logging out:", err);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="bg-[#0f0f0f] text-white w-full h-full flex flex-col border-r border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <IoChatboxEllipses className="text-green-500 text-2xl" />
          <span className="text-lg font-semibold tracking-wide">SyncTalk</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 hover:bg-zinc-800 rounded-full transition"
          >
            <SlUser className="text-xl text-white" />
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-44 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl animate-fadeIn z-20">
              <p
                onClick={handleProfile}
                className="px-4 py-2 hover:bg-green-600 transition cursor-pointer"
              >
                Profile
              </p>
              <hr className="border-zinc-700" />
              <p
                onClick={handleLogout}
                className="px-4 py-2 text-red-500 hover:bg-zinc-800 cursor-pointer"
              >
                Logout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-3 flex items-center gap-2 bg-zinc-950 border-b border-zinc-800">
        <CiSearch className="text-xl text-zinc-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-white placeholder-zinc-500 w-full focus:outline-none"
        />
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-3 space-y-1">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-800/30 cursor-pointer transition-all duration-200 group"
            >
              <div className="relative">
                <img
                  src={user.profilePic || "/default-avatar.webp"}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700 group-hover:border-green-500"
                />
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0f0f0f] ${
                    user.online ? "bg-green-500" : "bg-zinc-600"
                  }`}
                ></span>
              </div>

              <div className="flex flex-col">
                <p className="font-medium">{user.username}</p>
                <span className="text-sm text-zinc-400 truncate max-w-[180px]">
                  {user.lastMessage || "Hey there! I'm using SyncTalk"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-zinc-400 py-6">
            {search ? `No users found for "${search}"` : "No users available"}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
