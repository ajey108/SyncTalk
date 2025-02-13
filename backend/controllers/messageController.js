import Message from "../models/messages.js";
import cloudinary from "../config/cloudinary.js";

const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text, image } = req.body;
    console.log(req.body.receiver); // Check the receiver value

    let imageUrl = "";

    // If there is an image, upload it to Cloudinary
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image, {
        folder: "chat-app/messages",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });

      imageUrl = uploadedResponse.secure_url; // Get the Cloudinary image URL
    }

    const message = new Message({ sender, receiver, text, image: imageUrl });
    await message.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.query;

    const messages = await Message.find({
      $or: [
        { sender, receiver }, // Messages sent by the sender
        { sender: receiver, receiver: sender }, // Messages received by the sender
      ],
    })
      .sort({ createdAt: 1 }) // Sort messages in order
      .select("sender receiver text image createdAt"); // Only fetch required fields

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { sendMessage, getMessages };
