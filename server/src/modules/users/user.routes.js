import express from "express"
import {register} from "./user.controller.js"
import {validate} from "../../middlewares/validate.middleware.js"
import {registerSchema} from "./user.validation.js"

const router = express.Router()

router.post('/signup', validate(registerSchema) ,register)

export default router;