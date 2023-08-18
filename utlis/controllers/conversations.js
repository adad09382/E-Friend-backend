import conversation from "../models/conversations.js";
import users from "../models/users.js";
import { StatusCodes } from "http-status-codes";
import { getMessageFromValidationError } from "../utlis/error.js";

export const create = async (req, res) => {
  try {
    console.log("開始創建Conversation");
    const result = await conversation.create({
      user: req.user._id, // 這ID 是在auth.jwt 這middleware中寫在req上的
      topic: req.body.topic,
      history: [
        {
          role: "system",
          content: req.body.prompt,
        },
      ],
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "創建Conversation成功",
      result,
    });
    console.log("創建Conversation成功");
  } catch (error) {
    console.log("創建Conversation失敗");
    console.log(error);
    if (error.name === "ValidationError") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error),
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "發生錯誤",
      });
    }
  }
};

// 獲得某User的所有conversation
export const get = async (req, res) => {
  try {
    const result = await conversation.find({ user: req.user._id });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "發生錯誤",
    });
  }
};
// 獲得某id的conversation
export const getId = async (req, res) => {
  try {
    const result = await conversation.findById(req.params.id);
    if (!result) {
      throw new Error("NOT FOUND");
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
  } catch (error) {
    if (error.name === "CastError") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "格式錯誤",
      });
    } else if (error.message === "NOT FOUND") {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "找不到",
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "發生錯誤",
      });
    }
  }
};

// 修改prompt
export const edit = async (req, res) => {
  try {
    console.log("開始修改conversation");
    // 前端發來的新對話紀錄
    const newHistoryItem = {
      role: req.body.role,
      content: req.body.content,
      audioLink: req.file?.path,
    };
    const result = await conversation.findByIdAndUpdate(
      req.params.id, // 傳入指定 conversation Id
      {
        $push: { history: newHistoryItem },
        $set: { updatedAt: Date.now() },
      },
      { new: true, runValidators: true }
    );
    if (!result) {
      console.log("沒找到指定id 的conversation");
      throw new Error("NOT FOUND");
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
    console.log("成功修改conversation");
  } catch (error) {
    console.log("修改conversation失敗");
    console.log(error);
    if (error.name === "ValidationError") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error),
      });
    } else if (error.name === "CastError") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "格式錯誤",
      });
    } else if (error.message === "NOT FOUND") {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "找不到",
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "發生錯誤",
      });
    }
  }
};
