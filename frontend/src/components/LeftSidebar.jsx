import React, { useState, useEffect } from "react";
import { SlUser } from "react-icons/sl";

import { CiSearch } from "react-icons/ci";
import { IoChatboxEllipses } from "react-icons/io5";
import API from "../api/axiosInstance";
import { toast } from "react-toastify";

const LeftSidebar = ({ setSelectedUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  console.log("users in leftsidebar", users);

  //search users

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  //get users for letfsidebar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users/");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  //profile
  const handleProfile = () => {
    window.location.href = "/profile";
  };

  //logouot
  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      toast.success("Logged out successfully");
      setTimeout(() => {
        window.location.href = "/"; // Redirect to login page
      }, 800);
    } catch (err) {
      console.error("Error logging out:", err);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="bg-zinc-900 text-white border-2  w-[300px] h-screen shadow-lg  overflow-hidden">
      {/* Header Section */}
      <div className="p-4 flex justify-between items-center border-b border-green-500">
        <div className="flex items-center gap-2">
          <IoChatboxEllipses className="text-2xl" />
          <span className="text-lg font-semibold">SYNCTALK💬</span>
        </div>

        <div className="relative">
          {/* 🔹 Menu Icon */}
          <div className="group">
            <p className="text-3xl cursor-pointer hover:text-gray-700 transition duration-200">
              <SlUser />
            </p>

            {/* 🔹 Dropdown Menu (Visible on Hover) */}
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <p
                onClick={handleProfile}
                className="px-4 py-2 text-gray-700 hover:bg-green-500 rounded-md cursor-pointer"
              >
                Profile
              </p>
              <hr className="border-gray-200 my-1" />
              <p
                onClick={handleLogout}
                className="px-4 py-2 text-red-500 hover:bg-red-100 rounded-md cursor-pointer"
              >
                Logout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 flex items-center gap-2">
        <CiSearch className="text-xl text-gray-300" />
        <input
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border border-gray-400 rounded-md px-3 py-1 text-white w-full focus:outline-none focus:ring-2 focus:ring-white-400"
        />
      </div>

      {/* Chat List */}
      <div className="p-3 overflow-y-auto h-full">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-green-800 cursor-pointer transition duration-200"
              onClick={() => setSelectedUser(user)} // Set selected user on click
            >
              <img
                src={user.profilePic || "/default-avatar.webp"} // Use user's profile picture if available
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-md font-semibold">{user.username}</p>
                <span className="text-sm text-gray-300">
                  {user.lastMessage || "Hey there!"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-300">No users found.</p> // Show message if no users
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
