// Native bridge: Android WebView has no Web Bluetooth and no SpeechRecognition,
// so inside the APK these two features go through Capacitor plugins.
import { Capacitor } from "@capacitor/core";
import { BleClient } from "@capacitor-community/bluetooth-le";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { TextToSpeech } from "@capacitor-community/text-to-speech";

const enc = new TextEncoder();
const dec = new TextDecoder();
let speaking = false, ttsId = 0;

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

  stopListening() { SpeechRecognition.stop().catch(() => {}); },

  // Native text-to-speech (Android WebView has no working speechSynthesis).
  isSpeaking() { return speaking; },
  async speak(text, lang, interrupt) {
    const id = ++ttsId;
    if (interrupt) { try { await TextToSpeech.stop(); } catch (e) {} }
    speaking = true;
    try {
      await TextToSpeech.speak({ text, lang: lang || "en-US", rate: 1.0, pitch: 1.0, volume: 1.0, category: "playback", queueStrategy: interrupt ? 0 : 1 });
    } catch (e) { console.error("TTS error", e); }
    if (id === ttsId) speaking = false;
  },
  stopSpeaking() { ttsId++; speaking = false; TextToSpeech.stop().catch(() => {}); }
};
