import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import compression from "compression";

const app = express();
// Honor proxy headers so protocol and host detection work behind load balancers
app.set('trust proxy', true);
app.use(compression());
app.use(cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
}))
app.use(express.json({
    // Increased size to allow base64 preview image payloads from the Designer
    // Now supports 3-4 high-resolution images (scale 3x-4x)
    limit: "50mb"
}))
app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}))
app.use(express.static("public"));
app.use(cookieParser());

// Canonical/redirect middleware for public HTML requests only
app.use((req, res, next) => {
    try {
        const canonicalHost = 'www.vasanwears.in';

        // Only apply to likely HTML page requests (skip API and asset requests)
        const isApi = req.path.startsWith('/api');
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(req.path);
        const acceptsHtml = req.accepts && req.accepts('html');

        if (isApi || hasExtension || !acceptsHtml) return next();

        const forwardedProto = (req.headers['x-forwarded-proto'] || req.protocol || '').split(',')[0].trim();
        const isHttps = forwardedProto === 'https' || req.protocol === 'https';
        const hostHeader = (req.headers.host || '').toLowerCase();
        const isWww = hostHeader.startsWith('www.');

        // If not https or not the preferred host, redirect to canonical https + www URL
        if (!isHttps || !isWww) {
            const redirectUrl = `https://${canonicalHost}${req.originalUrl}`;
            return res.redirect(301, redirectUrl);
        }

        // Build canonical URL: https://www.vasanwears.in + normalized pathname (drop query/hash)
        let pathname = req.path.replace(/\/+$/,'');
        if (pathname === '') pathname = '/';
        const canonicalUrl = `https://${canonicalHost}${pathname.endsWith('/') ? pathname : pathname + '/'}`;

        // Set Link header for canonical (search engines can read this)
        res.setHeader('Link', `<${canonicalUrl}>; rel="canonical"`);
    } catch (err) {
        // on error, don't block request
        console.error('Canonical middleware error:', err);
    }
    return next();
});
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
import ratingRoutes from "./routes/rating.routes.js"
import couponRoutes from "./routes/coupon.routes.js"
import promotionRoutes from "./routes/promotion.routes.js"
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
app.use("/api/ratings", ratingRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/promotions", promotionRoutes);
app.get("/redis-test", async (req, res) => {
  await redisClient.set("hello", "vasanwears");
  const value = await redisClient.get("hello");
  res.json({ redis: value });
});
export {app}
