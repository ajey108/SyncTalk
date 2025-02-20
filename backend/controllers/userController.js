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

//get single user

export const getCurrentUser = async (req, res) => {
  console.log("req.user:", req.user);
  try {
    // Check if user is set in req.user (from middleware)
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Fetch user details from the database
    const user = await User.findById(req.user.userId).select(
      "username profilePic status email"
    );
    console.log("Fetched user is", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
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
