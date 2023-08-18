import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.ObjectId,
      ref: "users",
      required: [true, "查無該用戶"],
    },
    topic: {
      type: String,
      required: [true, "缺少Conversation topic"],
    },
    history: [
      {
        role: {
          type: String,
          required: [true, "缺少發送信息角色"],
          enum: ["user", "assistant", "system"], // role can only be 'user', 'assistant', or 'system'
        },
        content: {
          type: String,
          required: [true, "缺少信息內容"],
        },
        audioLink: String,
      },
    ],
  },
  { versionKey: false, timestamps: true }
);

export default mongoose.model("conversation", schema);
