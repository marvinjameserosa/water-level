#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include "camera_handler.h"
#include "sensor_handler.h"

// ==========================================
// NODE CONFIGURATION
// Change to 'false' when flashing Node 2
// ==========================================
#define IS_NODE_1 false 

#if IS_NODE_1
  IPAddress local_IP(192, 168, 4, 2);
  String nodeId = "node_1";
#else
  IPAddress local_IP(192, 168, 4, 3);
  String nodeId = "node_2";
#endif

IPAddress gateway(192, 168, 4, 1);
IPAddress subnet(255, 255, 255, 0);

WebServer server(80);

void setup() {
  Serial.begin(115200);
  Serial.println("\n--- Starting ESP32-CAM " + nodeId + " ---");

  // Seed random number generator for mock sensor data
  randomSeed(micros());

  // Initialize Modules
  setupCamera();
  setupSensor();

  // Force Static IP
  if (!WiFi.config(local_IP, gateway, subnet)) {
    Serial.println("STA Failed to configure Static IP");
  }

  // Connect to Pico Access Point
  Serial.print("Connecting to AP 'waterlevel'");
  WiFi.begin("waterlevel");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP Address: " + WiFi.localIP().toString());

  // Setup API Routes
  server.on("/capture", HTTP_GET, []() {
    handleCapture(server);
  });
  server.on("/sensor", HTTP_GET, []() {
    handleSensorRead(server);
  });
  
  // CORS Preflight for the Next.js Dashboard
  server.on("/capture", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
  });
  server.on("/sensor", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
  });

  // Start listening
  server.begin();
  Serial.println("Web server started. Waiting for triggers...");
}

void loop() {
  // Listen for incoming requests from Next.js
  server.handleClient();
}