import passport from "passport";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import bcrypt from "bcrypt";
import users from "../models/users.js";

// 定義 passport 驗證策略
// 定義名為login的驗證方式，此方式基於passport-local策略
passport.use(
  "login",
  new passportLocal.Strategy(
    {
      usernameField: "account",
      passwordField: "password",
    },
    // 實際驗證用 callbackFn
    async (account, password, done) => {
      try {
        console.log("passport 登入驗證");
        console.log("查找查找用戶");
        const user = await users.findOne({ account });
        if (!user) {
          throw new Error("USER");
        }
        if (!bcrypt.compareSync(password, user.password)) {
          throw new Error("PASSWORD");
        }
        // done(error, user, info)，參數為Error Object、user Object(資料庫找到的)、info（可選）包含驗證策略的信息Object
        console.log("passport login驗證設置");
        return done(null, user);
      } catch (error) {
        console.log("passport 驗證失敗");
        console.log(error);
        if (error.message === "USER") {
          return done(null, false, { message: "帳號不存在" });
        } else if (error.message === "PASSWORD") {
          return done(null, false, { message: "密碼錯誤" });
        } else {
          return done(null, false, { message: "錯誤" });
        }
      }
    }
  )
);

passport.use(
  "jwt",
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(), // 用於從HTTP Authorization標頭中提取Bearer Token的方法
      secretOrKey: process.env.JWT_SECRET, // 設定 JWT key
      passReqToCallback: true, // true 的話可在callbackFn中使用 req object
      ignoreExpiration: true, // 忽略過期檢查，這樣才能將過期JWT換新JWT
    },
    async (req, payload, done) => {
      try {
        // 檢查過期狀態
        // payload 是JWT儲存的用戶相關資訊
        // payload.exp 是解析出來的JWT過期時間，單位是秒 ；Date.now() 單位是毫秒
        const expired = payload.exp * 1000 < Date.now();
        /*
    
    */
        const url = req.baseUrl + req.path;
        if (expired && url !== "/users/extend" && url !== "/users/logout") {
          throw new Error("EXPIRED");
        }
        // 將已存在headers的JWT Token取出
        const token = req.headers.authorization.split(" ")[1];
        const user = await users.findOne({ _id: payload._id, tokens: token });
        if (!user) {
          throw new Error("NO USER");
        }
        return done(null, { user, token });
      } catch (error) {
        console.log(error);
        if (error.message === "EXPIRED") {
          return done(null, false, { message: "登入逾時" });
        } else if (error.message === "NO USER") {
          return done(null, false, { message: "使用者或JWT無效" });
        } else {
          return done(error, false, { message: "錯誤" });
        }
      }
    }
  )
);
