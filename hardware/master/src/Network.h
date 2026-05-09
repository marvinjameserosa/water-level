#pragma once
#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include "Battery.h"

#define MAX_IMAGE_SIZE 80000 // 80KB per image (VGA max limit)

struct NodeData {
  float h = 0.0;
  float d = 0.0;
  float diff = 0.0;
  bool hasImage = false;
  bool captureRequested = false;
  size_t imageSize = 0;
  uint8_t* imageBuffer = nullptr;
};

class Network {
public:
  Network();
  ~Network();
  void begin(Battery* battery);
  void handleClient();
  void sendMeasurement(const Measurement &m); // Kept for compatibility

private:
  WebServer server;
  Battery* _battery;

  NodeData node1;
  NodeData node2;

  void setupAP();
  void setupRoutes();

  void handleUpload();
  void handleState();
  void handleImage();
  void handleOptions();
  void handleTrigger();
  void handlePoll();
};
