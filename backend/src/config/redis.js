import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let redisClient = null;
let isRedisConnected = false;

try {
  redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        console.warn("[Redis] Connection retries exhausted. Running in fallback mode without Redis cache.");
        return null; // Stop retrying automatically
      }
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true,
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    console.log(`[Redis] Connected successfully to ${REDIS_HOST}:${REDIS_PORT}`);
  });

  redisClient.on("error", (err) => {
    if (isRedisConnected) {
      console.warn("[Redis] Warning:", err.message);
    }
    isRedisConnected = false;
  });

  // Attempt initial connect
  redisClient.connect().catch((err) => {
    console.warn(`[Redis] Failed initial connection to ${REDIS_HOST}:${REDIS_PORT}. Operating in DB fallback mode.`);
    isRedisConnected = false;
  });
} catch (err) {
  console.warn("[Redis] Client initialization error. Operating without Redis.");
}

export async function getCache(key) {
  if (!redisClient || !isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}

export async function setCache(key, value, ttlSeconds = 300) {
  if (!redisClient || !isRedisConnected) return;
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    // Ignore cache write errors
  }
}

export async function deleteCache(key) {
  if (!redisClient || !isRedisConnected) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    // Ignore cache delete errors
  }
}

export default redisClient;
