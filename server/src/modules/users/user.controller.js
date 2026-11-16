import {
  registerUser,
  loginUser,
  refreshUserTokens,
  logoutUser,
} from "./user.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";


// register
export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    return res
      .status(200)
      .json(new ApiResponse(200, user, "user registered sucessfully"));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
      .status(200)
      .cookie("refreshToken", result.refreshToken, options)
      .cookie("accessToken", result.accessToken, options)
      .json(new ApiResponse(200, result, "Login successful"));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) throw new ApiError(401, "Refresh token is required");
    const tokens = await refreshUserTokens(token);
    return res
      .status(200)
      .json(new ApiResponse(200, tokens, "Tokens refreshed"));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    await logoutUser(token);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (error) {
    next(error);
  }
};
