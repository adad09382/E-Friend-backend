import mongoose from "mongoose";

// Prompt Schema
const schema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, "缺少prompt主題"],
      default: "assistant",
    },
    content: {
      type: String,
      required: [true, "缺少prompt內容"],
      default: "You are a helpful assistant",
    },
    image: {
      type: String,
      required: [true, "缺少圖片"],
    },
    category: {
      type: String,
      required: [true, "缺少分類"],
      enum: {
        values: [
          "日常話題",
          "興趣話題",
          "旅遊話題",
          "職場話題",
          "考試口說",
          "情境話題",
        ],
        message: "分類錯誤",
      },
    },
    active: {
      type: Boolean,
      required: [true, "缺少啟用狀態"],
      default: true,
    },
  },
  { versionKey: false }
);

export default mongoose.model("prompts", schema);
