import prompts from "../models/prompts.js";
import { StatusCodes } from "http-status-codes";
import { getMessageFromValidationError } from "../utlis/error.js";

export const create = async (req, res) => {
  try {
    console.log("開始創建Prompt");
    const result = await prompts.create({
      topic: req.body.topic,
      content: req.body.content,
      image: req.file.path,
      category: req.body.category,
      active: req.body.active,
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
    console.log("創建Prompt成功");
  } catch (error) {
    console.log("創建Prompt失敗");
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

// 獲得所有的prompt 包含未啟用的
export const getAll = async (req, res) => {
  try {
    console.log("管理員開始getAll Prompt");
    const result = await prompts.find();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
    console.log("管理員成功getAll Prompt");
  } catch (error) {
    console.log("管理員失敗getAll Prompt");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "發生錯誤",
    });
  }
};

// 獲得所以已啟用的prompt
export const get = async (req, res) => {
  try {
    console.log("開始get Prompt");
    const result = await prompts.find({ active: true });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
    console.log("get Prompt成功");
  } catch (error) {
    console.log("get Prompt失敗");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "發生錯誤",
    });
  }
};

// 修改prompt
export const edit = async (req, res) => {
  try {
    console.log("開始修改prompt");
    const result = await prompts.findByIdAndUpdate(
      req.params.id,
      {
        topic: req.body.topic,
        content: req.body.content,
        image: req.file?.path,
        category: req.body.category,
        active: req.body.active,
      },
      { new: true, runValidators: true }
    );
    if (!result) {
      throw new Error("NOT FOUND");
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
    console.log("成功修改prompt");
  } catch (error) {
    console.log("修改prompt失敗");
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
