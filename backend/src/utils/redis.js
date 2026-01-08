import { createClient } from "redis";

let redisClient;

if (!redisClient) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      keepAlive: 1000,
      reconnectStrategy: (retries) => {
        if (retries > 5) return false;
        return Math.min(retries * 100, 3000);
      },
    },
  });

  redisClient.on("connect", () => {
    console.log("✅ Upstash Redis connected");
  });

  redisClient.on("error", (err) => {
    console.log("⚠️ Redis warning:", err.message);
  });

  redisClient.on("end", () => {
    console.log("ℹ️ Redis connection closed");
  });

  await redisClient.connect();
}

export default redisClient;
