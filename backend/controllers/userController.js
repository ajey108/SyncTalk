import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";

// Get All Users for Sidebar (Excluding Logged-in User)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      "username profilePic status"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Profile (Profile Pic, Name, Status)
export const updateProfile = async (req, res) => {
  try {
    const { username, status, profilePic } = req.body;
    let imageUrl = req.user.profilePic; // Keep old image if no new image is provided

    if (profilePic) {
      const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "chat-app/profiles",
      });
      imageUrl = uploadedResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, status, profilePic: imageUrl },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
