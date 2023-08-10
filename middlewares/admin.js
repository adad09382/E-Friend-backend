import { StatusCodes } from "http-status-codes";
import userRole from "../enum/userRole.js";

export default (req, res, next) => {
  if (req.user.role === userRole.USER) {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "沒有權限",
    });
  } else {
    next();
  }
};
