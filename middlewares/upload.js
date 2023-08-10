import multer from "multer"; // 用於處理 multipart/form-data 的 node.js 中間件，主要用於上傳檔案
import { v2 as cloudinary } from "cloudinary"; // cloudinary SDK，用於圖像和視頻管理
import { CloudinaryStorage } from "multer-storage-cloudinary"; // multer-storage-cloudinary，用於將上傳的檔案儲存到Cloudinary的multer存儲引擎
import { StatusCodes } from "http-status-codes";

// 配置cloudinary使用的API密鑰和雲名稱，這些都從環境變數中獲取
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/**
檔案上傳 Cloudinary 設定函式
@param {Array} type  可以接受檔案的Array [String]
@return  {multer}  回傳 Multer 實例
 */
// 設定multer的存儲引擎為Cloudinary，並設定一些上傳的限制
const uploadSetting = (acceptedFormats) => {
  console.log("開始multer實例設定");
  return multer({
    storage: new CloudinaryStorage({ cloudinary }), // 指定存儲引擎為Cloudinary
    // 設定檔案過濾器
    fileFilter(req, file, cb) {
      if (acceptedFormats.includes(file.mimetype)) {
        console.log("完成multer實例設定");
        cb(null, true);
      } else {
        cb(new multer.MulterError("LIMIT_FILE_FORMAT"), false); // 檔案格式不符合，回傳一個錯誤
      }
    },
    limits: {
      fileSize: 1024 * 1024, // 檔案大小的上限為1MB
    },
  });
};

/**
上傳處理的函式
@param {multer} upload multer實例用於處理檔案上傳設定
@param {String} fileType 預期的檔案類型
@return {Function} Express middleware，處理檔案上傳並根據錯誤情況回應
*/
const handleUpload = (upload, fileType) => {
  return (req, res, next) => {
    console.log("上傳middleware開始處理");
    upload.single(fileType)(req, res, (error) => {
      // 如果發生了MulterError，則將錯誤信息返回給用戶
      if (error instanceof multer.MulterError) {
        let message = "上傳錯誤";
        if (error.code === "LIMIT_FILE_SIZE") {
          message = "檔案太大";
        } else if (error.code === "LIMIT_FILE_FORMAT") {
          message = "檔案格式錯誤";
        }
        console.log("MulterError");
        console.log(error);
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message,
        });
      } else if (error) {
        console.log("發生錯誤");
        console.log(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "發生錯誤",
        });
      } else {
        console.log("上傳middleware 處理通過");
        next();
      }
    });
  };
};

const uploadImage = uploadSetting(["image/jpg", "image/jpeg", "image/png"]);
const uploadAudio = uploadSetting(["audio/webm", "audio/ogg", "audio/wav"]);

export const uploadImageMiddleware = handleUpload(uploadImage, "image");
export const uploadAudioMiddleware = handleUpload(uploadAudio, "audio");
