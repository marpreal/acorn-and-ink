// Stage all album audio + covers under unique, flat names for a GitHub Release.
// GitHub release assets share one namespace, so "01.mp3" from every album would
// collide — we name them "<album-id>__01.mp3" (matching wire-release.mjs).
import fs from "node:fs";
import path from "node:path";

const OUT = "/home/koaxial1930/WorkSpace/.acorn-release";
const ts = fs.readFileSync(path.resolve("src/lib/tracks.ts"), "utf8");
const m = ts.match(/export const ALBUMS: Album\[\] = (\[[\s\S]*?\]);\s*\n\nexport const TRACKS/);
if (!m) { console.error("Could not find ALBUMS in tracks.ts"); process.exit(1); }
const albums = JSON.parse(m[1]);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const assetName = (publicPath) => {
  // "/sounds/<id>/<name>" -> "<id>__<name>"
  const m2 = publicPath.match(/^\/sounds\/([^/]+)\/(.+)$/);
  return m2 ? `${m2[1]}__${m2[2]}` : path.basename(publicPath);
};
const link = (src, dest) => {
  try { fs.linkSync(src, dest); } catch { fs.copyFileSync(src, dest); }
};

let n = 0;
for (const al of albums) {
  if (al.cover) {
    const src = path.resolve("public" + al.cover);
    if (fs.existsSync(src)) { link(src, path.join(OUT, assetName(al.cover))); n++; }
  }
  for (const t of al.tracks) {
    const src = path.resolve("public" + t.file);
    if (fs.existsSync(src)) { link(src, path.join(OUT, assetName(t.file))); n++; }
  }
}
let bytes = 0;
for (const f of fs.readdirSync(OUT)) bytes += fs.statSync(path.join(OUT, f)).size;
console.log(`Staged ${n} files (${(bytes / 1e9).toFixed(2)} GB) in ${OUT}`);
