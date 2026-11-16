import express from "express"
import { register, login, refresh, logout } from "./user.controller.js"
import {validate} from "../../middlewares/validate.middleware.js"
import {registerSchema, loginSchema} from "./user.validation.js"

const router = express.Router()

router.post('/signup', validate(registerSchema) ,register)
router.post('/login', validate(loginSchema), login)
router.post('/refresh', refresh)
router.post('/logout', logout)

export default router;
