require("dotenv/config");
const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const { WebClient } = require("@slack/web-api");
const app = express();
const sclient = new WebClient(process.env.SLACK_BOT_TOKEN);
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  socket.on("get-emojis-list", () => {});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
