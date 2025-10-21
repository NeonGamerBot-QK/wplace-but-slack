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
const cache = new Map();

io.on("connection", (socket) => {
  socket.on("get-emojis-list", async () => {
    if (cache.has("emojis-list")) {
      socket.emit("emojis-list", cache.get("emojis-list"));
      return;
    }
    const emojis = await sclient.emoji.list();
    cache.set("emojis-list", emojis);
    setInterval(() => cache.delete("emojis-list"), 5 * 60 * 1000); // Cache for 5 minutes
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
