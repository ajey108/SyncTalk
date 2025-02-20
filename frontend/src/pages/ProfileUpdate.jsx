import React, { useState } from "react";
import { RxAvatar } from "react-icons/rx";
import { IoMdChatboxes } from "react-icons/io";

const ProfileUpdate = () => {
  const [image, setImage] = useState(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <form className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-gray-800 text-center">
            Profile Details
          </h3>

          {/* Upload Avatar */}
          <label
            htmlFor="avatar"
            className="cursor-pointer flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 transition"
          >
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <RxAvatar className="text-4xl text-gray-500" />
            )}
            <span className="text-sm text-gray-600">Upload Profile Image</span>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
            />
          </label>

          {/* Name Input */}
          <input
            type="text"
            placeholder="Your Name"
            required
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Bio Input */}
          <textarea
            placeholder="Your Bio"
            required
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>

          {/* Save Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold p-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save
          </button>
        </form>

        {/* Chat Icon */}
        <div className="mt-4 flex justify-center">
          <IoMdChatboxes className="text-3xl text-blue-500 cursor-pointer hover:text-blue-700 transition" />
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdate;
