import passport from "passport";
import jsonwebtoken from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

// 調用 passport 驗證策略

export const login = (req, res, next) => {
  console.log("開始auth.login 驗證");
  passport.authenticate("login", { session: false }, (error, user, info) => {
    if (error || !user) {
      if (info.message === "Missing credentials") {
        info.message = "缺少憑證";
      }
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: info.message,
      });
    }
    req.user = user;
    console.log("通過auth.login 驗證");
    next();
  })(req, res, next);
};

export const jwt = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, data, info) => {
    if (error || !data) {
      if (info instanceof jsonwebtoken.JsonWebTokenError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "JWT錯誤",
        });
      } else {
        if (info.message === "No auth token") {
          info.message = "缺少JWT";
        }
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: info.message || "錯誤",
        });
      }
    }
    req.user = data.user;
    req.token = data.token;
    next();
  })(req, res, next);
};
