// Native bridge: Android WebView has no Web Bluetooth and no SpeechRecognition,
// so inside the APK these two features go through Capacitor plugins.
import { Capacitor } from "@capacitor/core";
import { BleClient } from "@capacitor-community/bluetooth-le";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

const enc = new TextEncoder();
const dec = new TextDecoder();

window.NativeBridge = {
  isNative: Capacitor.isNativePlatform(),

  // Connect to the ESP32; returns a function that writes text to it.
  async connectBLE(service, characteristic, name, onText, onDisconnect) {
    await BleClient.initialize({ androidNeverForLocation: true });
    const device = await BleClient.requestDevice({ name, optionalServices: [service] });
    await BleClient.connect(device.deviceId, () => onDisconnect());
    await BleClient.startNotifications(device.deviceId, service, characteristic, v => onText(dec.decode(v)));
    return async text => {
      const bytes = enc.encode(text);
      await BleClient.write(device.deviceId, service, characteristic, new DataView(bytes.buffer));
    };
  },

  async speechReady() {
    const { available } = await SpeechRecognition.available();
    if (!available) return false;
    const p = await SpeechRecognition.requestPermissions();
    return p.speechRecognition === "granted";
  },

  // Listens for one phrase and returns the text ("" if nothing heard).
  async listen() {
    const r = await SpeechRecognition.start({ language: "en-US", maxResults: 1, partialResults: false, popup: false });
    return (r && r.matches && r.matches[0]) || "";
  },

  stopListening() { SpeechRecognition.stop().catch(() => {}); }
};
