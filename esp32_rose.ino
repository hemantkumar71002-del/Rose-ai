
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Rose AI BLE settings - index.html ke UUID se match
#define DEVICE_NAME "ESP32_Object_Detector"

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// HC-SR04
#define TRIG_PIN 5
#define ECHO_PIN 18

// Four push buttons
#define BTN_CAMERA 27
#define BTN_VOICE  13
#define BTN_MIC    14
#define BTN_SOS    25

BLECharacteristic *pCharacteristic = nullptr;
bool deviceConnected = false;

unsigned long lastDistanceTime = 0;
const unsigned long DISTANCE_INTERVAL = 500;

// Button debounce state
struct Button {
  int pin;
  const char *command;
  int lastReading;
  int stableState;
  unsigned long lastChange;
};

Button buttons[] = {
  {BTN_CAMERA, "BTN:CAM", HIGH, HIGH, 0},
  {BTN_VOICE,  "BTN:VOICE", HIGH, HIGH, 0},
  {BTN_MIC,    "BTN:MIC", HIGH, HIGH, 0},
  {BTN_SOS,    "BTN:SOS", HIGH, HIGH, 0}
};

const int BUTTON_COUNT = sizeof(buttons) / sizeof(buttons[0]);

void sendBLE(String message) {
  if (!deviceConnected || pCharacteristic == nullptr) {
    return;
  }

  pCharacteristic->setValue(message.c_str());
  pCharacteristic->notify();

  Serial.print("BLE sent: ");
  Serial.println(message);
}

float readDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(3);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    return -1;
  }

  return duration * 0.0343 / 2.0;
}

void checkUltrasonic() {
  if (millis() - lastDistanceTime < DISTANCE_INTERVAL) {
    return;
  }

  lastDistanceTime = millis();

  float distance = readDistanceCM();

  if (distance > 0 && distance <= 400) {
    String message = "DIST:" + String((int)round(distance));
    sendBLE(message);

    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.println(" cm");
  } else {
    sendBLE("DIST:NONE");
    Serial.println("Distance: Out of range");
  }
}

void checkButtons() {
  for (int i = 0; i < BUTTON_COUNT; i++) {
    int reading = digitalRead(buttons[i].pin);

    if (reading != buttons[i].lastReading) {
      buttons[i].lastChange = millis();
      buttons[i].lastReading = reading;
    }

    if (millis() - buttons[i].lastChange >= 40) {
      if (reading != buttons[i].stableState) {
        buttons[i].stableState = reading;

        // Button pressed: INPUT_PULLUP means LOW
        if (buttons[i].stableState == LOW) {
          sendBLE(buttons[i].command);

          Serial.print("Button pressed: ");
          Serial.println(buttons[i].command);
        }
      }
    }
  }
}

class RoseServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *server) override {
    deviceConnected = true;
    Serial.println("Rose AI connected!");
  }

  void onDisconnect(BLEServer *server) override {
    deviceConnected = false;
    Serial.println("Rose AI disconnected!");
    BLEDevice::startAdvertising();
    Serial.println("BLE advertising restarted");
  }
};

class RoseCharacteristicCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) override {
    String received = String(characteristic->getValue().c_str());
    received.trim();

    Serial.print("Rose AI received: ");
    Serial.println(received);

    // App se aane wale messages yahan receive honge.
    // Example: STATE:C1V1M0S0, SOS:ON, FACE:Name
  }
};

void setup() {
  Serial.begin(115200);
  delay(500);

  // Ultrasonic pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);

  // Button pins
  for (int i = 0; i < BUTTON_COUNT; i++) {
    pinMode(buttons[i].pin, INPUT_PULLUP);
    buttons[i].lastReading = digitalRead(buttons[i].pin);
    buttons[i].stableState = buttons[i].lastReading;
  }

  // BLE setup
  BLEDevice::init(DEVICE_NAME);

  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new RoseServerCallbacks());

  BLEService *service = server->createService(SERVICE_UUID);

  pCharacteristic = service->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_NOTIFY
  );

  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setCallbacks(new RoseCharacteristicCallbacks());
  pCharacteristic->setValue("Rose AI Ready");

  service->start();

  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("==============================");
  Serial.println("ROSE AI ESP32 FIRMWARE READY");
  Serial.println("Device: ESP32_Object_Detector");
  Serial.println("BLE advertising started");
  Serial.println("==============================");
}

void loop() {
  checkButtons();
  checkUltrasonic();

  delay(5);
}
