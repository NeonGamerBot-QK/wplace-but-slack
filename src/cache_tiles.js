const fs = require("fs");

function getCacheFile(z, x, y) {
  return fs.existsSync(`./tiles/${z}/${x}/${y}/tile.png`)
    ? fs.readFileSync(`./tiles/${z}/${x}/${y}/tile.png`)
    : null;
}
function setCacheFile(z, x, y, buffer) {
  fs.mkdirSync(`./tiles/${z}/${x}/${y}`, { recursive: true });
  fs.writeFileSync(`./tiles/${z}/${x}/${y}/tile.png`, buffer);
}
module.exports = {
  getCacheFile,
  setCacheFile,
};

