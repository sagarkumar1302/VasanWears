import "dotenv/config";
import { app } from "./app.js";
import connectDb from "./db/db.js";
import http from "http";
import { Server } from "socket.io";

const port = process.env.PORT || 4000;

const server = http.createServer(app);

export const io = new Server(server, {
    cors: { origin: process.env.FRONT_END_URL },
    credentials: true,
});

export const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log("User connected:", userId);

        // ✅ Emit to all – user is now online
        io.emit("userOnline", { userId });
    }

    // Also send the updated online user list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        if (userId) {
            console.log("User disconnected:", userId);

            delete userSocketMap[userId];

            // ✅ Emit to all – user is now offline
            io.emit("userOffline", { userId });

            // Updated online list
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

connectDb()
    .then(() => {
        server.listen(port, () => {
            console.log("Port is running on", port);
        });
        console.log("DB connected");
    })
    .catch((error) => {
        console.log("DB connection failed");
    });

app.get("/", (req, res) => {
    res.send("Hello World!");
});
