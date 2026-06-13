// Rewrite src/lib/tracks.ts so every audio/cover path points at the GitHub
// Release assets (public) instead of local /sounds/. Run after the upload.
//   /sounds/<id>/<name>  ->  <BASE>/<id>__<name>
import fs from "node:fs";
import path from "node:path";

const BASE = "https://github.com/marpreal/acorn-and-ink/releases/download/music-v1";
const file = path.resolve("src/lib/tracks.ts");
let ts = fs.readFileSync(file, "utf8");

const before = ts;
ts = ts.replace(/"\/sounds\/([^/"]+)\/([^"]+)"/g, (_m, id, name) => `"${BASE}/${id}__${name}"`);

if (ts === before) {
  console.log("No /sounds/ paths found — already wired? Nothing changed.");
} else {
  const count = (before.match(/"\/sounds\//g) || []).length;
  fs.writeFileSync(file, ts);
  console.log(`Rewrote ${count} paths in src/lib/tracks.ts → GitHub Release URLs.`);
}
