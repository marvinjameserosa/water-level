#include "sensor_handler.h"

// --- HARDWARE CONFIGURATION ---
#define TRIG_PIN 14
#define ECHO_PIN 13

// --- CALIBRATION CONSTANTS ---
// Adjust SOUND_SPEED if the error gets worse at longer distances.
// 0.0343 is standard for room temperature (~20°C).
const float SOUND_SPEED = 0.0343; 
const int SAMPLES = 15; 

void setupSensor() {
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    Serial.println("Stabilized Sensor Logic (Raw) Initialized.");
}

float getAverageDistance() {
    float total = 0;
    int successfulPings = 0;

    for (int i = 0; i < SAMPLES; i++) {
        digitalWrite(TRIG_PIN, LOW);
        delayMicroseconds(2);
        digitalWrite(TRIG_PIN, HIGH);
        delayMicroseconds(10);
        digitalWrite(TRIG_PIN, LOW);

        // 30ms timeout for about 5 meters range
        long duration = pulseIn(ECHO_PIN, HIGH, 30000);

        if (duration > 0) {
            float raw = (duration * SOUND_SPEED) / 2.0;
            total += raw;
            successfulPings++;
        }

        // Short delay between pings to let internal echoes dissipate
        delay(25); 
    }

    if (successfulPings == 0) return 0.0;
    
    // Return the pure average without the 0.6 subtraction
    return (total / successfulPings);
}

void handleSensorRead(WebServer& server) {
    Serial.println("Processing raw stabilized read...");
    
    float distance = getAverageDistance();

    // Matching your Next.js backend expectation
    String jsonResponse = "{\"distance\": " + String(distance, 2) + "}";
    
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Connection", "close");
    server.send(200, "application/json", jsonResponse);
    
    Serial.print("Raw Distance Sent: ");
    Serial.println(jsonResponse);
}