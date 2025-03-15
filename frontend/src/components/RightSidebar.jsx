import React, { useEffect } from "react";
import { GoDotFill } from "react-icons/go";
import { useAuth } from "../context/AuthContext";

const RightSidebar = () => {
  const { user, loading, updateUser } = useAuth();

  // Call updateUser() when user updates profile
  useEffect(() => {
    updateUser();
  }, []);
  if (loading) return <p>Loading...</p>;
  return (
    <div className="bg-gray-500 text-white shadow-lg h-full w-[300px]   p-6 ">
      {/* 🔹 Profile Section */}
      <div className="flex items-center gap-3 mb-4">
        <img
          className="w-12 h-12 rounded-full object-cover"
          src={user.profilePic || "./person1.webp"} // Use user profile pic or default
          alt="User Avatar"
        />
        <div>
          <h3 className="text-lg font-semibold">{user.username}</h3>
          <p className="text-sm text-green-500 flex items-center gap-1">
            <GoDotFill className="text-green-500" /> Online
          </p>
        </div>
      </div>
      <p className="text-white mb-4">{user.status || "hey there"}</p>

      <hr className="mb-4 opacity-50" />

      {/* 🔹 Media Section */}
      <h4 className="text-md font-semibold mb-3">Shared Media</h4>
      <div className="grid grid-cols-2 gap-3">
        {Array(4)
          .fill(user.profilePic || "/default-avatar.png")
          .map((imgSrc, index) => (
            <img
              key={index}
              className="w-28 h-28 rounded-lg object-cover shadow-md cursor-pointer hover:scale-105 transition duration-200"
              src={imgSrc}
              alt="Shared Media"
            />
          ))}
      </div>
    </div>
  );
};

export default RightSidebar;
