import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", MessageSchema);
