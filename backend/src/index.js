import "dotenv/config";
import { app } from "./app.js";
import connectDb from "./db/db.js";

// ✅ Redis starts ONCE here


const port = process.env.PORT || 4000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log("🚀 Server running on port", port);
    });
    console.log("✅ DB connected");
  })
  .catch(() => {
    console.log("❌ DB connection failed");
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});
