import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: {
      type: String,
      default:
        "https://ih1.redbubble.net/image.620662991.9817/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.u6.jpg",
    },
    status: { type: String, default: "Hey there! I'm using  SyncTalk" },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
