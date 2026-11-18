// Adds the permissions the app needs to the generated Android manifest.
const fs = require("fs");
const file = "android/app/src/main/AndroidManifest.xml";
let x = fs.readFileSync(file, "utf8");
const perms = [
  "CAMERA", "RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS", "VIBRATE",
  "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"
].filter(p => !x.includes("android.permission." + p))
 .map(p => `    <uses-permission android:name="android.permission.${p}" />`).join("\n");
x = x.replace("<application", perms + "\n    <uses-feature android:name=\"android.hardware.camera\" android:required=\"false\" />\n\n    <application");
if (!x.includes("<queries>")) {
  x = x.replace("</manifest>", "    <queries>\n        <intent>\n            <action android:name=\"android.speech.RecognitionService\" />\n        </intent>\n        <intent>\n            <action android:name=\"android.intent.action.TTS_SERVICE\" />\n        </intent>\n    </queries>\n</manifest>");
}
fs.writeFileSync(file, x);
console.log("Manifest patched");
