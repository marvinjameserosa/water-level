#include <Arduino.h>
#include "Battery.h"
#include "Network.h"

const int voltagePin = 26;

Battery battery;
Network network;

unsigned long lastBatteryRead = 0;
const unsigned long batteryInterval = 800;

void setup() {
  Serial.begin(115200);
  delay(2000); // Wait for native USB serial to connect
  Serial.println("Starting Master Node...");
  battery.begin(voltagePin);
  network.begin(&battery);
}

void loop() {
  network.handleClient();

  if (millis() - lastBatteryRead >= batteryInterval) {
    lastBatteryRead = millis();
    Measurement m = battery.read();

    Serial.print("Pin Voltage: ");
    Serial.print(m.vOut, 3);
    Serial.print("V  |  Battery: ");
    Serial.print(m.vIn, 2);
    Serial.print("V  |  Percentage: ");

    if (battery.isWarmingUp()) {
      Serial.println("Stabilizing...");
    } else {
      Serial.print(m.percentage);
      Serial.println("%");
    }
  }
}