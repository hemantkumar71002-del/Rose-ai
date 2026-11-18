# Rose (APK project)

## Build the APK online (no Android Studio needed)
1. Create a new GitHub repo and upload everything in this folder
   (keep the `.github/workflows/build-apk.yml` path).
2. Open the repo > Actions > "Build APK" > Run workflow.
3. When it finishes, download `speaking-ai-detector-apk` from the run page,
   unzip it and install `app-debug.apk` on your phone (allow "install unknown apps").

## Build on a PC instead
    npm install
    npm run bundle
    npx cap add android
    node scripts/patch-manifest.js
    node scripts/set-icon.js
    npx cap sync android
    npx cap open android      # then Build > Build APK(s)

## Notes
- First launch needs internet (AI models load from a CDN).
- Allow Camera, Microphone and Nearby devices (Bluetooth) when asked.
- Inside the APK, Bluetooth and voice commands use native plugins
  (src/bridge.js). In the browser version they use Web Bluetooth / Web Speech.
- Voice commands in the APK listen one phrase at a time; Android may play a
  small beep between phrases.
- The debug APK is for personal use. Play Store needs a signed release build.
