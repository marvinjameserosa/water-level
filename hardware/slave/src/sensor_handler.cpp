#include "sensor_handler.h"

// --- SENSOR CONFIGURATION ---
#define TRIG_PIN 14
#define ECHO_PIN 13

void setupSensor() {
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    Serial.println("Ultrasonic sensor hardware initialized on Pins 13 & 14.");
}

void handleSensorRead(WebServer& server) {
    Serial.println("Sensor read requested...");
    
    // 1. Send the Ultrasonic Ping
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // 2. Read the Echo pulse (30ms timeout)
    long duration = pulseIn(ECHO_PIN, HIGH, 30000); 

    // 3. Handle Sensor Failure/Timeout
    if (duration == 0) {
        Serial.println("Error: Sensor timeout (No echo received).");
        server.sendHeader("Access-Control-Allow-Origin", "*");
        server.sendHeader("Connection", "close");
        server.send(500, "application/json", "{\"error\": \"Sensor timeout\"}");
        return;
    }

    // 4. Process the Math (Raw Distance Only)
    // Speed of sound is 0.034 cm/microsecond. Divide by 2 for the round trip.
    float distance = (duration * 0.034) / 2.0;

    // 5. Construct the JSON payload
    // We send 'distance' as 'diff' so your Next.js alert logic works immediately.
    // We send 0 for h and d since we are no longer calculating container depth.
    String jsonResponse = "{";
    jsonResponse += "\"h\":0,";
    jsonResponse += "\"d\":0,";
    jsonResponse += "\"diff\":" + String(distance, 2);
    jsonResponse += "}";
    
    // 6. Send the Response
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Connection", "close");
    server.send(200, "application/json", jsonResponse);
    
    Serial.println("Raw distance measured: " + String(distance, 2) + " cm");
}