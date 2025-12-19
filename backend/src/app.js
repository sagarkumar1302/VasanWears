import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express();
app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
}))
app.use(express.json({
    limit: "4mb"
}))
app.use(express.urlencoded({
    extended: true
}))
app.use(express.static("public"));
app.use(cookieParser());
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
export {app}
