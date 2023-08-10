import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Configuration, OpenAIApi } from "openai";
import routeUsers from "./routes/users.js";
import routePrompts from "./routes/prompts.js";
import routeConversation from "./routes/conversations.js";
import "./passport/passport.js";

// 設定 OpenAI 設定
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();
// 限制請求的middleware
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘 (15 * 60 * 1000毫秒)
    max: 100, // 最多100次請求
    // 設定回應headers
    standardHeaders: true,
    legacyHeaders: false,
    // 超出流量時回應的狀態碼
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    // 超出流量時回應的訊息
    message: "太多請求",
    // 超出流量時回應的function
    handler(req, res, next, options) {
      res.status(options.statusCode).json({
        success: false,
        message: options.message,
      });
    },
  })
);
// 處理跨域請求的middleware
app.use(cors());

// app.use(
//   cors({
//     // origin = 請求來源， callbackFn = 是否允許
//     origin(origin, callbackFn) {
//       if (
//         origin === undefined ||
//         origin.includes("github") ||
//         origin.includes("localhost")
//       ) {
//         callbackFn(null, true);
//       } else {
//         callbackFn(new Error("CORS", false));
//       }
//     },
//   })
// );
// middleware錯誤處理
app.use((_, req, res, next) => {
  res.status(StatusCodes.FORBIDDEN).json({
    success: false,
    message: "請求被拒",
  });
});
app.use(express.json()); // 將req.body轉換為JSON物件
app.use((_, req, res, next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: "資料格式錯誤",
  });
});
// 消毒用middleware，用以防止注入攻擊
app.use(mongoSanitize());

// 配置路由
app.use("/users", routeUsers);
app.use("/prompts", routePrompts);
app.use("/conversation", routeConversation);

// 404網頁設定
app.all("*", (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "404 找不到頁面",
  });
});

app.listen(process.env.PORT || 4000, async () => {
  console.log("server is running");
  await mongoose.connect(process.env.DB_URL);
  mongoose.set("sanitizeFilter", true); // 防止他人進行資料庫攻擊，加上消毒Filter，將 丟進去的Object 都放進 $ep:{}
  console.log("database in connecting");
});
