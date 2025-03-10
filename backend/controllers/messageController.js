import Message from "../models/messages.js";
import cloudinary from "../config/cloudinary.js";

const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text, image } = req.body;
    console.log(
      "sender, receiver, text, image:",
      sender,
      receiver,
      text,
      image
    );

    // Save message with already uploaded image URL
    const message = new Message({ sender, receiver, text, image });
    await message.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params; // ✅ Extract sender & receiver from params

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "Missing sender or receiver ID" });
    }

    console.log("Sender:", senderId, "Receiver:", receiverId); // Debugging

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .select("sender receiver text image createdAt");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { sendMessage, getMessages };
