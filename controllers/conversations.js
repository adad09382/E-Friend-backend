import conversation from "../models/conversations.js";
import { StatusCodes } from "http-status-codes";
import { getMessageFromValidationError } from "../utlis/error.js";
import OpenAI from "openai";

// 設定 OpenAI 設定
// old
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_KEY,
// });
// console.log(configuration.apiKey);
// const openai = new OpenAIApi(configuration);
// New
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // This is also the default, can be omitted
});

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
// 獲得某User的所有最新的conversation
export const getLast = async (req, res) => {
  try {
    console.log("開始獲得該用戶的最新對話id");
    const result = await conversation
      .findOne({ user: req.user._id })
      .sort({ updatedAt: -1 }); // -1 代表降序排序，1 代表升序排序
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

// 用戶發來新訊息，來修改conversation history
export const edit = async (req, res) => {
  try {
    console.log("收到用戶發來訊息，開始修改conversation history");
    // 前端發來的新對話紀錄
    console.log("錄音檔案路徑是：");
    console.log(req.file.path);
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

// 收到前端發來的conversation ID，去找該conversation history，並送給GPT，處裡完在回傳前端
export const aiEdit = async (req, res) => {
  try {
    console.log("收到conversation ID：" + req.params.id);
    // 根據前端前來的conversation Id 去資料庫拿對話紀錄
    const foundTargetConversation = await conversation.findById(req.params.id);
    // 如果conversation不存在，則返回null或其他適當的響應
    if (!foundTargetConversation) {
      console.log("沒找到指定id 的conversation");
      throw new Error("NOT FOUND");
    }
    console.log("找到指定conversation ");

    // 將找到的對話History當作歷史紀錄餵給chatGpt
    // 將history 進行處理，將 role & content 以外的內容移除。
    const cleanedHistory = foundTargetConversation.history.map((message) => {
      return {
        role: message.role,
        content: message.content,
      };
    });
    // 創建OpenAI完成
    console.log("ai開始生成回覆");
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 使用的模型名稱
      messages: cleanedHistory, // 提供給模型的提示，模型將基於此生成回應
      max_tokens: 1000, // 在完成時生成的最大token數，可以確保模型的回覆不會過長。設定太低可能會截斷模型的回覆，使回答難以理解
      temperature: 0, // 數值介於0和1之間，控制模型回覆的隨機性，數值越高表示模型在生成時會更具有創意和隨機性，但有時可能會偏離正軌
      top_p: 1, // 與temperature類似，控制模型回覆的隨機性，數值越低表示回答更具有創意和隨機性
      frequency_penalty: 0.5, // 數值介於-2.0和2.0之間。正值會根據文本中到目前為止的現有頻率懲罰新令牌，降低模型重複相同內容的可能性
      presence_penalty: 0, // 數值介於-2.0和2.0之間。正值會根據文本中是否出現懲罰新令牌，增加模型談論新主題的可能性
    });
    // 將AI回的回覆新增到對話紀錄中
    console.log(aiResponse.choices[0].message); // aiResponse.data.choices[0].text 是gpt回答的內容
    console.log("將ai的回應存進 mongodb");
    const aiUpdateHistory = await conversation.findByIdAndUpdate(
      req.params.id, // 傳入指定 conversation Id
      {
        $push: { history: aiResponse.choices[0].message },
        $set: { updatedAt: Date.now() },
      },
      { new: true, runValidators: true }
    );
    if (!aiUpdateHistory) {
      console.log("沒找到指定id 的conversation");
      throw new Error("NOT FOUND");
    }
    // 獲取ai 新增內容後的完整conversation
    console.log("新增完成在get一次完整的conversation，並回傳");
    const result = await conversation.findById(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
    console.log("AI成功修改conversation");
  } catch (error) {
    console.log("AI修改conversation失敗");
    if (error instanceof OpenAI.APIError) {
      console.log("openai錯誤");
      console.error(error.status); // e.g. 401
      console.error(error.message); // e.g. The authentication token you passed was invalid...
      console.error(error.code); // e.g. 'invalid_api_key'
      console.error(error.type); // e.g. 'invalid_request_error'
    }
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
      console.log(error); // Non-API error
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "發生錯誤",
      });
    }
  }
};
