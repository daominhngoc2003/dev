import { verifyTokenMatch } from "../helpers/generateJWT.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Bạn cần đăng nhập để thực hiện hành động này!",
      });
    }

    const accessToken = authHeader && authHeader.split(" ")[1];

    let payload = "";
    try {
      payload = verifyTokenMatch(accessToken);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(400).json({
          message: "Token đã hết hạn!",
        });
      } else {
        return res.status(400).json({
          message: "Token không hợp lệ!",
        });
      }
    }

    const {
      payload: { _id },
    } = payload;

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        message: "Tài khoản không tồn tại!",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export default authenticate;
