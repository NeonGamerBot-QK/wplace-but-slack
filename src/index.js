require("dotenv/config");
const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const { WebClient } = require("@slack/web-api");
const app = express();
const sclient = new WebClient(process.env.SLACK_BOT_TOKEN);
const server = http.createServer(app);
const io = socketIO(server);
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { getCacheFile, setCacheFile } = require("./cache_tiles");
const PORT = process.env.PORT || 3000;
const cache = new Map();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.get("/", (req, res) => {
  res.render("index");
});
io.on("connection", (socket) => {
  socket.on("get-emojis-list", async () => {
    if (cache.has("emojis-list")) {
      socket.emit("emojis-list", cache.get("emojis-list"));
      return;
    }
    const emojis = await sclient.emoji.list().then((d) => d.emoji);
    cache.set("emojis-list", emojis);
    setInterval(() => cache.delete("emojis-list"), 5 * 60 * 1000); // Cache for 5 minutes
  });
  socket.on("ping", () => {
    socket.emit("pong");
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
app.post("/change-tile/:z/:x/:y", express.json(), async (req, res) => {
  const { z, x, y } = req.params;
  const { emoji } = req.body;
  const emojiLink = cache.get("emojis-list")[emoji];
  if (!emojiLink) {
    res.status(400).send("Invalid emoji");
    return;
  }
  const fileData = getCacheFile(z, x, y);
  if (!fileData) {
    res.status(404).send("Tile not found in cache");
    return;
  }
  const properTile = await loadImage(fileData);
  const emojiImage = await loadImage(emojiLink);
  const canvas = createCanvas(properTile.width, properTile.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(properTile, 0, 0);
  const emojiSize = properTile.width / 4;
  ctx.drawImage(
    emojiImage,
    properTile.width - emojiSize - 5,
    properTile.height - emojiSize - 5,
    emojiSize,
    emojiSize
  )
});

app.get("/proxy/:z/:x/:y.png", async (req, res) => {
  const { z, x, y } = req.params;
  // res.set("Content-Type", "application/x-protobuf");
  const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  if (z >= 15 || process.env.REMOVE_ZOOM_RESTRICTIONS) {
    // console.log(z);
    const cache = getCacheFile(z, x, y);
    if (cache) {
      console.log("cache hit");
      res.header("X-Cache", "HIT");
      res.send(cache);
      return;
    }
    res.header("X-Cache", "MISS");
    const tile = await loadImage(buffer);
    const canvas = createCanvas(tile.width, tile.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(tile, 0, 0);

    if (process.env.DEBUG_LINES) {
      // draw a border around the img
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.font = "20px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(`z ${z} x ${x} y ${y}`, 10, 30);
    }
    const buffer2 = canvas.toBuffer("image/png");
    res.send(buffer2);
    if (process.env.SHOW_CACHE_DIFF) {
      // draw a border around the img
      const canvas2 = createCanvas(tile.width, tile.height);
      const ctx2 = canvas2.getContext("2d");
      ctx2.drawImage(tile, 0, 0);
      ctx2.strokeStyle = "blue";
      ctx2.lineWidth = 4;
      ctx2.strokeRect(0, 0, canvas2.width, canvas2.height);
      ctx2.font = "20px Arial";
      ctx2.fillStyle = "blue";
      ctx2.fillText(`z ${z} x ${x} y ${y}`, 10, 30);
      const buffer3 = canvas2.toBuffer("image/png");
      setCacheFile(z, x, y, buffer3);
    } else {
      setCacheFile(z, x, y, buffer2);
    }
  } else {
    res.send(Buffer.from(buffer));
  }
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
