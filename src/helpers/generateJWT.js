import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateAccessToken = (payload) => {
  const accessToken = jwt.sign({ payload }, process.env.JWT_ATK_PRIVATE, {
    expiresIn: process.env.JWT_ATK_EXP,
  });
  return accessToken;
};

export const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign({ payload }, process.env.JWT_RFT_PRIVATE, {
    expiresIn: process.env.JWT_RFT_EXP,
  });
  return refreshToken;
};

export const verifyTokenMatch = (accessToken) => {
  const verifyToken = jwt.verify(accessToken, process.env.JWT_ATK_PRIVATE);
  return verifyToken;
};
