import React from "react";
import { GoDotFill } from "react-icons/go";

const RightSidebar = ({ selectedUser, messages }) => {
  console.log("messages from right", messages);
  if (!selectedUser)
    return (
      <div className="bg-zinc-900 text-white shadow-lg h-full w-[300px] p-6 flex flex-col items-center justify-center">
        <img
          className="w-24 h-24 mb-4"
          src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTZtYWZodXpodDd2MTk5bDlraHlzMTIwdmRwNmlpaWxzZHIycWxtcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YyKPbc5OOTSQE/giphy.gif"
          alt="No media available"
        />
      </div>
    );

  //   get only images
  const sharedMedia = messages
    .filter((msg) => msg.image)
    .map((msg) => msg.image); // Extract the image URLs

  console.log("images from sharedMed is", sharedMedia);

  return (
    <div className="bg-zinc-900 text-white shadow-lg h-full w-[300px] p-6">
      {/* 🔹 Profile Section */}
      <div className="flex items-center gap-3 mb-4">
        <img
          className="w-12 h-12 rounded-full object-cover"
          src={selectedUser.profilePic || "./person1.webp"}
          alt="User Avatar"
        />
        <div>
          <h3 className="text-lg font-semibold">{selectedUser.username}</h3>
          <p className="text-sm text-green-500 flex items-center gap-1">
            <GoDotFill className="text-green-500" /> Online
          </p>
        </div>
      </div>
      <p className="text-white mb-4">{selectedUser.status || "hey there"}</p>

      <hr className="mb-4 opacity-50" />

      {/* 🔹 Media Section */}
      <h4 className="text-md font-semibold mb-3">Shared Media</h4>
      <div className="grid grid-cols-2 gap-3">
        {sharedMedia.length > 0 ? (
          sharedMedia.map((imgSrc, index) => (
            <img
              key={index}
              className="w-28 h-28 rounded-lg object-cover shadow-md cursor-pointer hover:scale-105 transition duration-200"
              src={imgSrc}
              alt={`Shared Media ${index + 1}`}
            />
          ))
        ) : (
          <p className="text-gray-700">No shared media available</p>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
