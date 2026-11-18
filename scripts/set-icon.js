// Copies the Rose icon into the generated Android project (replaces the default icon).
const fs = require("fs"), path = require("path");
const res = "android/app/src/main/res";
const src = "resources/android";
for (const d of fs.readdirSync(src)) {
  const dest = path.join(res, d);
  fs.mkdirSync(dest, { recursive: true });
  for (const f of ["ic_launcher.png", "ic_launcher_round.png"]) fs.copyFileSync(path.join(src, d, f), path.join(dest, f));
  const fg = path.join(dest, "ic_launcher_foreground.png");
  if (fs.existsSync(fg)) fs.rmSync(fg);
}
// Remove the adaptive-icon XML so Android uses the PNG icons above.
fs.rmSync(path.join(res, "mipmap-anydpi-v26"), { recursive: true, force: true });
for (const d of fs.readdirSync(res)) {
  if (d.startsWith("drawable")) for (const f of fs.readdirSync(path.join(res, d)))
    if (f.startsWith("ic_launcher_foreground")) fs.rmSync(path.join(res, d, f));
}
console.log("Rose icon installed");
