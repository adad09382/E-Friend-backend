import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import userRole from "../enum/userRole.js";

const schema = new mongoose.Schema(
  {
    account: {
      type: String,
      required: [true, "缺少帳號"],
      minlength: [4, "帳號長度不得小於4"],
      maxlength: [20, "帳號長度不得大於20"],
      unique: true,
      match: [/^[A-Za-z0-9]+$/, "帳號格式錯誤"],
    },
    password: {
      type: String,
      required: [true, "缺少密碼"],
    },
    email: {
      type: String,
      required: [true, "缺少信箱"],
      unique: true,
      validate: {
        validator(value) {
          return validator.isEmail(value);
        },
        message: "信箱格式錯誤",
      },
    },
    tokens: {
      type: [String],
      default: [],
    },
    role: {
      type: Number,
      default: userRole.USER,
    },
  },
  { versionKey: false }
);

// 在新增用戶資料進存進資料庫前，在驗證密碼長短，通過即加密
schema.pre("save", function (next) {
  console.log("資料儲存前觸發");
  const user = this;
  if (user.isModified("password")) {
    console.log("密碼有修改的話，驗證密碼長短");

    if (user.password.length < 4) {
      const error = new mongoose.Error.ValidationError(null);
      error.addError(
        "password",
        new mongoose.Error.ValidatorError({ message: "密碼太短" })
      );
      next(error);
      return;
    } else if (user.password.length > 20) {
      const error = new mongoose.Error.ValidationError(null);

      error.addError(
        "password",
        new mongoose.Error.ValidatorError({ message: "密碼太長" })
      );

      next(error);
      return;
    } else {
      user.password = bcrypt.hashSync(user.password, 10);
      console.log("加密完成");
    }
  }
  next();
  console.log("資料儲存完成觸發");
});

// 修改密碼
schema.pre("findOneAndUpdate", function (next) {
  const user = this._update;
  if (user.password) {
    if (user.password.length < 4) {
      const error = new mongoose.Error.ValidationError(null);
      error.addError(
        "password",
        new mongoose.Error.ValidatorError({ message: "密碼太短" })
      );
      next(error);
      return;
    } else if (user.password.length > 20) {
      const error = new mongoose.Error.ValidationError(null);
      error.addError(
        "password",
        new mongoose.Error.ValidatorError({ message: "密碼太長" })
      );
      next(error);
      return;
    } else {
      user.password = bcrypt.hashSync(user.password, 10);
    }
  }
});

export default mongoose.model("user", schema);
