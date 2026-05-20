const path = require("path");
const fs = require("fs");
const { getRedisClient } = require("../utils/redisClient");

const getSocketIOMajorVersion = () => {
  try {
    const socketIOEntry = require.resolve("socket.io");
    const packagePath = path.join(path.dirname(socketIOEntry), "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    return Number((pkg.version || "0").split(".")[0]);
  } catch (err) {
    return 0;
  }
};

const configureSocketScaling = async (io) => {
  try {
    const socketIOMajor = getSocketIOMajorVersion();
    if (socketIOMajor < 4) {
      console.warn("Socket.io Redis adapter disabled: @socket.io/redis-adapter requires Socket.IO v4+. Current server uses Socket.IO v3.");
      return;
    }

    const redis = await getRedisClient();
    if (!redis) return;

    const { createAdapter } = require("@socket.io/redis-adapter");
    const pubClient = redis;
    const subClient = pubClient.duplicate();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Đã cấu hình Socket.io thành công");
  } catch (err) {
    console.warn("Cấu hình Socket.io không thành công:", err.message);
  }
};

module.exports = configureSocketScaling;
