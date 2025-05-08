import React, { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { API_URL } from "../cofig";

const ProfileUpdate = () => {
  const { user, setUser } = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false); // State for loader

  const [formData, setFormData] = useState({
    username: "",
    status: "",
  });

  console.log("User data:", user);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Generate preview URL
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader

    const data = new FormData();
    data.append("username", formData.username);
    data.append("status", formData.status);
    if (image) {
      data.append("profilePic", image);
    }

    try {
      const response = await API_URL.put("/users/update", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        console.log("Updated User from API:", response.data);
        setUser(response.data); // Update user in context
        toast.success("Profile updated successfully!");

        setTimeout(() => {
          window.location.href = "/chat";
        }, 600);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-4">
      <div className="text-white border-4 shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold  text-center mb-6">Update Profile</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username Input */}
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          {/* Status Textarea */}
          <textarea
            placeholder="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            required
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24"
          />

          {/* Image Preview */}
          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border border-gray-300"
              />
            </div>
          )}

          {/* File Upload */}
          <label className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <span className="text-gray-500">📷 Upload Profile Picture</span>
          </label>

          {/* Submit Button with Loader */}
          <button
            className="bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin border-t-2 border-white border-solid rounded-full w-5 h-5"></div>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;
