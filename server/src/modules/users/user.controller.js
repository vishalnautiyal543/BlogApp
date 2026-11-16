import {registerUser} from "./user.service.js"
import {ApiResponse} from "../../utils/ApiResponse.js"
import { ApiError } from "../../utils/ApiError.js";

export const register = async(req,res,next) =>{
    try {

        const user = await registerUser(req.body);

        return res.status(200).json(
            new ApiResponse(200,user,"user registered sucessfully")
        )
        
    } catch (error) {
       next(error)
    }
}