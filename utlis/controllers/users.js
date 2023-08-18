import { StatusCodes } from "http-status-codes";
import users from "../models/users.js";
import { getMessageFromValidationError } from "../utlis/error.js";
import jwt from "jsonwebtoken";

export const create = async (req, res) => {
  try {
    await users.create(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error),
      });
    } else if (error.name === "MongoServerError" && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: "帳號已註冊",
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "發生錯誤^_^",
      });
    }
  }
};

export const login = async (req, res) => {
  try {
    console.log("controller 開始驗證，製作token");
    // 使用user的_id + JWT_SECRET 製作token
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7 days",
    });
    // 在 Mongoose模型實例的tokens中push一串token
    req.user.tokens.push(token);
    // 調用 Mongoose的模型實例的save()函式，該模型實例由來 passport.js -> auth.js -> users.js(routes) ->users.js(controllers)
    await req.user.save();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result: {
        token,
        account: req.user.account,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "發生錯誤",
    });
  }
};

export const logout = async (req, res) => {
  try {
    // 將 Authorization 頭部的token 從user的tokens array 中移除 (只移除該登出設備的token)
    req.user.tokens = req.user.tokens.filter((token) => token !== req.token);
    await req.user.save();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "發生錯誤",
    });
  }
};
// token 舊換新
export const extend = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex((token) => token === req.token);
    // 使用user的_id + JWT_SECRET 製作token
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7 days",
    });
    req.user.tokens[idx] = token;
    await req.user.save();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result: token,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "發生錯誤",
    });
  }
};

export const getProfile = (req, res) => {
  try {
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result: {
        account: req.user.account,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "發生錯誤",
    });
  }
};
