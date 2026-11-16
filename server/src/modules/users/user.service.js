import { User } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../../config/env.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/generateToken.js";

// register user service
const registerUser = async ({ name, username, email, password }) => {

  const existingUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  }).select("email username");

  if (existingUser) {
    const field =
      existingUser.email === email ? "email" : "username";
    throw new ApiError(409, `A user with this ${field} already exists`);
  }

  try {
    const user = await User.create({ 
      name,
      username,
      email,
      password,
    });

    return user;

  } catch (error) {

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      throw new ApiError(409, `A user with this ${field} already exists`);
    }

    if (error.name === "ValidationError") {
      throw new ApiError(400, "Invalid user data", [error.message]);
    }

    throw error;
  }
}



// login user service
const loginUser = async ({ email, password }) => {
  
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!user || user.authProvider !== "local") {
    throw new ApiError(401, "Invalid user credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account is inactive");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;
  return { user: safeUser, accessToken, refreshToken };
};



// refresh token
const refreshUserTokens = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (payload.type !== "refresh") {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive || user.refreshToken !== token) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};



// logout user
const logoutUser = async (token) => {
  if (!token) return;
  let payload;
  try {
    payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch {
    return;
  }
  if (payload.type === "refresh") {
    await User.updateOne({ _id: payload.sub, refreshToken: token }, { $set: { refreshToken: "" } });
  }
};


export { registerUser, loginUser, refreshUserTokens, logoutUser };
