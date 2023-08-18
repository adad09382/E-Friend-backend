import { StatusCodes } from "http-status-codes";
/**
 *  檢查請求的 content-type 格式
 *  @param {string} type  content-type 格式
 *  @return middleware function
 */

export default (type) => {
  return (req, res, next) => {
    // 檢查請求的 Content-Type headers是否存在，且是否包含指定的類型。不存在則執行括號內的代碼。
    console.log("開始檢查Content-Type headers是否存在，且是否包含指定的類型");
    if (
      !req.headers["content-type"] ||
      !req.headers["content-type"].includes(type)
    ) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "格式錯誤",
      });
      console.log("檢查Content-Type headers 不存在 / 格式錯誤");
      return;
    }
    console.log("通過Content-Type headers檢查");
    next();
  };
};
