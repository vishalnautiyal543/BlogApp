import { User } from "./user.model.js";
import {ApiError} from "../../utils/ApiError.js"


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

    throw new ApiError(500, "User registration failed", [error]);
  }
}


export {registerUser}