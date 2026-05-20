const { getRedisClient } = require("../utils/redisClient");

const configureSessionStore = async (app) => {
  try {
    const session = require("express-session");
    const { RedisStore } = require("connect-redis");
    const redis = await getRedisClient();

    app.use(session({
      store: redis ? new RedisStore({ client: redis, prefix: "sess:" }) : undefined,
      secret: process.env.SESSION_SECRET || process.env.REFRESH_TOKEN_SECRET || "dev-session-secret-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }));

    console.log(redis ? "Đã bật Redis session store" : "Đã bật Memory session store");
  } catch (err) {
    console.warn("Session packages are not installed; JWT auth remains active.");
  }
};

module.exports = configureSessionStore;
