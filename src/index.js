require("dotenv/config");
const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const { WebClient } = require("@slack/web-api");
const app = express();
const sclient = new WebClient(process.env.SLACK_BOT_TOKEN);
const server = http.createServer(app);
const io = socketIO(server);
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { getCacheFile, setCacheFile } = require("./cache_tiles");
const PORT = process.env.PORT || 3000;
const cache = new Map();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.get('/', (req, res) => {
  res.render('index');
})
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
  socket.on('ping', () => {
    socket.emit('pong');
  })
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
app.get("/proxy/:z/:x/:y.png", async (req, res) => {
  const { z, x, y } = req.params;
  // res.set("Content-Type", "application/x-protobuf");
  const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  if (z >= 15) {
    console.log(z)
    const cache = getCacheFile(z, x, y)
    if (cache) {
      console.log('cache hit')
      res.send(cache);
      return;
    }
    const tile = await loadImage(buffer);
    const canvas = createCanvas(tile.width, tile.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(tile, 0, 0);
    if (process.env.DEBUG_LINES) {
      // draw a border around the img
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.font = '20px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText(`z ${z} x ${x} y ${y}`, 10, 30);
    }
    const buffer2 = canvas.toBuffer('image/png');
    res.send(buffer2);
    setCacheFile(z, x, y, buffer2);
  } else {

    res.send(Buffer.from(buffer));
  }

});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
