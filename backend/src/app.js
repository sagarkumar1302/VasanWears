import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import compression from "compression";
const app = express();
app.use(compression());
app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
}))
app.use(express.json({
    // Increased size to allow base64 preview image payloads from the Designer
    limit: "10mb"
}))
app.use(express.urlencoded({
    extended: true
}))
app.use(express.static("public"));
app.use(cookieParser());
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"
import categoryRoutes from "./routes/admincategory.routes.js"
import subCategoryRoutes from "./routes/adminsubcategory.routes.js"
import productRoutes from "./routes/adminproduct.routes.js"
import sizeRoutes from "./routes/size.routes.js"
import colorRoutes from "./routes/color.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import wishListRoutes from "./routes/wishlist.routes.js"
import orderRoutes from "./routes/order.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import subscriberRoutes from "./routes/subscriber.routes.js"
import contactRoutes from "./routes/contact.routes.js"
import designRoutes from "./routes/design.routes.js"
app.use("/api/colors", colorRoutes);
app.use("/api/sizes", sizeRoutes);
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishListRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/designs", designRoutes);
export {app}
