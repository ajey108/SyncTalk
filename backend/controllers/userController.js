import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

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

// Configure multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Update Profile (Profile Pic, Name, Status)
export const updateProfile = async (req, res) => {
  try {
    // Handle file upload
    upload.single("profilePic")(req, res, async (err) => {
      if (err) return res.status(500).json({ error: err.message });

      const { username, status } = req.body;
      console.log("Received data:", { username, status });

      let imageUrl = req.user.profilePic; // Keep the old profile picture

      if (req.file) {
        console.log("Uploading new profile picture...");

        // Upload image to Cloudinary and wait for response
        try {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "chat-app/profiles" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(req.file.buffer);
          });

          imageUrl = result.secure_url; // Get uploaded image URL
          console.log("Cloudinary Upload Success:", imageUrl);
        } catch (uploadError) {
          return res.status(500).json({ error: uploadError.message });
        }
      }

      // Update user in the database
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { username, status, profilePic: imageUrl },
        { new: true }
      );
      console.log("User from req.user:", req.user);
      console.log("User ID from req.user:", req.user?.id);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log("Updated User:", updatedUser);
      res.json(updatedUser); // Send updated user object
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: err.message });
  }
};
