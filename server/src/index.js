import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import {PORT} from "./config/env.js"




app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB()
})



