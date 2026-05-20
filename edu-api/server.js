require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const SocketServer = require("./socketServer");
const { ExpressPeerServer } = require("peer");
const path = require("path");
const rateLimit = require("./middleware/rateLimit");

// Configs
const connectDB = require("./config/db");
const configureSessionStore = require("./config/session");
const configureSocketScaling = require("./config/socket");

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(cors({ origin: "*" }));
app.use(cookieParser());
app.use(rateLimit({ windowSeconds: 60, max: Number(process.env.RATE_LIMIT_MAX) || 180 }));

// Security & compression
try {
  const helmet = require("helmet");
  const compression = require("compression");
  app.use(helmet());
  app.use(compression());
} catch (err) {
  console.warn("Optional security/compression packages are not installed.");
}

// Session store
configureSessionStore(app);

// Socket.io Setup
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

configureSocketScaling(io);
io.on("connection", (socket) => SocketServer(socket));

// PeerJS Server
const peerServer = ExpressPeerServer(http, { path: "/" });
app.use("/peerjs", peerServer);

// Routes
app.use("/api", require("./routes/index.routes"));

// API Docs
app.get("/api/docs.json", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "openapi.json"));
});

try {
  const swaggerUi = require("swagger-ui-express");
  const openapi = require("./docs/openapi.json");
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
} catch (err) {
  console.warn("Swagger UI package is not installed; use /api/docs.json instead.");
}

// Database Connection
connectDB();

// Production client serving
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

// Start Server
const port = process.env.PORT || 9090;
http.listen(port, () => {
  console.log("Máy chủ đang chạy trên cổng", port);
});
