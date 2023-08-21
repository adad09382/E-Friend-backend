import { StatusCodes } from "http-status-codes";
import axios from "axios";

const NEWS_API_KEY = process.env.NEWS_API;
const BASE_URL = "https://newsapi.org/v2/top-headlines";
// 獲得所有的prompt 包含未啟用的
export const get = async (req, res) => {
  try {
    console.log("後端向NEW API get 新聞");
    const pageSize = 15;
    const page = 1;
    const params = {
      country: "us",
      apiKey: NEWS_API_KEY,
      pageSize,
      page,
    };
    const { data } = await axios.get(BASE_URL, { params });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      data,
    });
    console.log("成功getAll 15則新聞");
  } catch (error) {
    console.log("失敗getAll 新聞");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "get新聞發生錯誤",
    });
  }
};
export const getMore = async (req, res) => {
  try {
    console.log("get  more 新聞");
    const pageSize = 15;
    console.log(req.body?.morePage);
    const page = 1 + req.body?.morePage;
    const params = {
      country: "us",
      apiKey: NEWS_API_KEY,
      pageSize,
      page,
    };
    const { data } = await axios.get(BASE_URL, { params });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      data,
    });
    console.log("成功get more 新聞");
  } catch (error) {
    console.log("失敗get more 新聞");
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "發生錯誤123",
    });
  }
};
