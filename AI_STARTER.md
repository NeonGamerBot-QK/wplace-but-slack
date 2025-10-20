Ah — now that makes a LOT more sense 👀

You don’t want a **pixel-art canvas** like r/place… you want something like [**wplace.live**](https://wplace.live/) — a **shared map** where people can **place markers / draw images** on top of **OpenStreetMap tiles** in real time.

That’s actually simpler in some ways — because OpenStreetMap gives you the **base map** for free, and all you need to handle is **real-time annotations**.

Here’s a solid starter example 👇

---

## 🧭 What You’ll Build

✅ Node.js + Express + Socket.IO
✅ Leaflet.js (OpenStreetMap frontend)
✅ Real-time markers / images
✅ Optional image upload & placing icons on the map

---

## 📦 1. Install dependencies

```bash
mkdir wplace-map
cd wplace-map
npm init -y
npm install express socket.io multer
```

---

## 🧰 2. `server.js` — backend with real-time updates

```js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// image uploads (optional)
const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});
app.use("/uploads", express.static("uploads"));

// store all placed markers/images in memory
let markers = [];

// socket.io
io.on("connection", (socket) => {
  console.log("🧍 User connected");

  // send all existing markers to new user
  socket.emit("init", markers);

  // handle new marker/image placement
  socket.on("placeMarker", (marker) => {
    markers.push(marker);
    io.emit("markerPlaced", marker);
  });

  // optionally remove markers
  socket.on("removeMarker", (id) => {
    markers = markers.filter((m) => m.id !== id);
    io.emit("markerRemoved", id);
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
```

---

## 🗺️ 3. `public/index.html` — frontend with Leaflet + Socket.IO

```html
<!doctype html>
<html>
  <head>
    <title>wplace map 🌍</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <style>
      html,
      body {
        margin: 0;
        height: 100%;
      }
      #map {
        height: 100%;
        width: 100%;
      }
      .custom-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
    </style>
  </head>
  <body>
    <input
      type="file"
      id="fileInput"
      style="position:absolute;z-index:999;top:10px;left:10px;"
    />
    <div id="map"></div>

    <script src="/socket.io/socket.io.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const socket = io();

      const map = L.map("map").setView([0, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const markers = {};

      // place a marker on click
      map.on("click", (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const id = Date.now().toString();
        const marker = { id, lat, lng, iconUrl: null };
        socket.emit("placeMarker", marker);
      });

      // draw markers already on the map
      socket.on("init", (data) => {
        data.forEach(addMarker);
      });

      // draw new markers when placed
      socket.on("markerPlaced", (marker) => {
        addMarker(marker);
      });

      function addMarker(marker) {
        const icon = marker.iconUrl
          ? L.icon({ iconUrl: marker.iconUrl, iconSize: [40, 40] })
          : undefined;
        const m = icon
          ? L.marker([marker.lat, marker.lng], { icon })
          : L.marker([marker.lat, marker.lng]);
        m.addTo(map);
        markers[marker.id] = m;
      }

      // handle image upload
      document
        .getElementById("fileInput")
        .addEventListener("change", async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const formData = new FormData();
          formData.append("image", file);
          const res = await fetch("/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          // after uploading, click on the map to place it
          map.once("click", (evt) => {
            const marker = {
              id: Date.now().toString(),
              lat: evt.latlng.lat,
              lng: evt.latlng.lng,
              iconUrl: data.url,
            };
            socket.emit("placeMarker", marker);
          });
        });
    </script>
  </body>
</html>
```

---

## 🧪 4. Run it

```bash
node server.js
```

Open `http://localhost:3000` in multiple browsers → click on the map to place markers, upload an image to place icons 🗺️🖼️
Everyone sees updates in **real time**.

---

## 🧭 Optional enhancements (like wplace.live)

- 🧭 Usernames / accounts
- 🕒 Cooldowns for placing markers
- 🧼 Marker expiration or delete buttons
- 📡 Persistent database (Redis or Postgres)
- 🖌️ Drawing lines or polygons, not just markers
- 📸 Custom marker icons or stickers

---

👉 **Summary:**

- Base map = OpenStreetMap via Leaflet
- Realtime = Socket.IO
- Image uploads = Multer + `<input type="file">`
- Shared state = marker array on server

Would you like me to add **drawing shapes (lines/polygons)** on the map too — like on wplace.live? ✍️🗺️
