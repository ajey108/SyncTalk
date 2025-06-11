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
  console.log(
    "get currentUser req.user and req.user._id are:",
    req.user,
    req.user._id
  );

  try {
    // Ensure we get the correct user ID
    const userId = req.user.userId || req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Fetch user details from the database
    const user = await User.findById(userId).select(
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
    const userFromDB = await User.findById(req.user.id); // or req.user._id
    let imageUrl = userFromDB?.profilePic || "";
    const { username, status } = req.body;

    if (req.file) {
      try {
        const base64Image = `data:${
          req.file.mimetype
        };base64,${req.file.buffer.toString("base64")}`;
        const result = await cloudinary.uploader.upload(base64Image, {
          upload_preset: "chat_sync",
          unsigned: true,
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({
          error: "Image upload failed",
          details: uploadError.message,
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, status, profilePic: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: err.message });
  }
};
