#include "Network.h"

Network::Network() : server(80), _battery(nullptr) {
  // Delay malloc until begin() to avoid global constructor heap issues
}

Network::~Network() {
  if (node1.imageBuffer) free(node1.imageBuffer);
  if (node2.imageBuffer) free(node2.imageBuffer);
}

void Network::begin(Battery* battery) {
  _battery = battery;
  
  if (!node1.imageBuffer) node1.imageBuffer = (uint8_t*)malloc(MAX_IMAGE_SIZE);
  if (!node2.imageBuffer) node2.imageBuffer = (uint8_t*)malloc(MAX_IMAGE_SIZE);

  setupAP();
  setupRoutes();
  server.begin();
  Serial.println("[Network] WebServer started.");
}

void Network::setupAP() {
  WiFi.persistent(false);
  WiFi.mode(WIFI_AP);
  
  // Explicitly anchor the Master Pico to 192.168.4.1
  IPAddress localIp(192, 168, 4, 1);
  IPAddress gateway(192, 168, 4, 1);
  IPAddress subnet(255, 255, 255, 0);
  WiFi.softAPConfig(localIp, gateway, subnet);
  
  delay(500);
  bool success = WiFi.softAP("waterlevel"); // Open Network
  
  if (!success) {
    Serial.println("[Network] Failed to set up AP");
  } else {
    IPAddress IP = WiFi.softAPIP();
    Serial.print("[Network] AP IP address: ");
    Serial.println(IP);
  }
}

void Network::setupRoutes() {
  server.on("/api/upload", HTTP_POST, std::bind(&Network::handleUpload, this));
  server.on("/api/state", HTTP_GET, std::bind(&Network::handleState, this));
  server.on("/api/image", HTTP_GET, std::bind(&Network::handleImage, this));
  server.on("/api/trigger", HTTP_GET, std::bind(&Network::handleTrigger, this));
  server.on("/api/poll", HTTP_GET, std::bind(&Network::handlePoll, this));
  
  server.on("/api/upload", HTTP_OPTIONS, std::bind(&Network::handleOptions, this));
  server.on("/api/state", HTTP_OPTIONS, std::bind(&Network::handleOptions, this));
  server.on("/api/image", HTTP_OPTIONS, std::bind(&Network::handleOptions, this));
  server.on("/api/trigger", HTTP_OPTIONS, std::bind(&Network::handleOptions, this));
  server.on("/api/poll", HTTP_OPTIONS, std::bind(&Network::handleOptions, this));
}

void Network::handleOptions() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
}

void Network::handleUpload() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  
  if (!server.hasArg("node")) {
    server.send(400, "text/plain", "Missing node parameter");
    return;
  }
  
  String nodeId = server.arg("node");
  NodeData* targetNode = nullptr;
  
  if (nodeId == "node_1") targetNode = &node1;
  else if (nodeId == "node_2") targetNode = &node2;
  else {
    server.send(400, "text/plain", "Invalid node parameter");
    return;
  }

  if (server.hasArg("h")) targetNode->h = server.arg("h").toFloat();
  if (server.hasArg("d")) targetNode->d = server.arg("d").toFloat();
  if (server.hasArg("diff")) targetNode->diff = server.arg("diff").toFloat();

  // Read raw binary body for image uploads
  if (server.hasHeader("Content-Length")) {
    size_t len = server.header("Content-Length").toInt();
    if (len > 0) {
      Serial.print("[Master] Upload payload size: ");
      Serial.println(len);
      
      if (len <= MAX_IMAGE_SIZE) {
        WiFiClient client = server.client();
        if (client.available()) {
          size_t bytesRead = 0;
          uint32_t startMs = millis();
          
          while (bytesRead < len && millis() - startMs < 5000) {
            if (client.available()) {
              size_t toRead = client.available();
              if (bytesRead + toRead > len) toRead = len - bytesRead;
              client.read(targetNode->imageBuffer + bytesRead, toRead);
              bytesRead += toRead;
            } else {
              delay(10);
            }
          }
          
          if (bytesRead == len) {
            targetNode->imageSize = len;
            targetNode->hasImage = true;
            Serial.println("[Master] Image completely received via stream.");
          } else {
            Serial.println("[Master] ERROR: Image stream timed out.");
          }
        } else if (server.hasArg("plain")) {
          // WebServer already buffered the body
          String body = server.arg("plain");
          if (body.length() == len) {
            memcpy(targetNode->imageBuffer, body.c_str(), len);
            targetNode->imageSize = len;
            targetNode->hasImage = true;
            Serial.println("[Master] Image successfully copied from buffer.");
          } else {
            Serial.println("[Master] ERROR: Buffered image size mismatch.");
          }
        }
      } else {
        Serial.println("[Master] ERROR: Image too large, rejected.");
      }
    }
  }

  server.send(200, "text/plain", "OK");
}

void Network::handleState() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  
  Measurement m = {0, 0, 0};
  if (_battery) m = _battery->read();

  // Clean up float values for valid JSON serialization
  float batVIn = isnan(m.vIn) ? 0.0 : m.vIn;
  int batPct = m.percentage; // percentage is an int, cannot be NaN
  
  float n1h = isnan(node1.h) ? 0.0 : node1.h;
  float n1d = isnan(node1.d) ? 0.0 : node1.d;
  float n1diff = isnan(node1.diff) ? 0.0 : node1.diff;
  
  float n2h = isnan(node2.h) ? 0.0 : node2.h;
  float n2d = isnan(node2.d) ? 0.0 : node2.d;
  float n2diff = isnan(node2.diff) ? 0.0 : node2.diff;

  String json = "{";
  json += "\"pico\":{";
  json += "\"batteryPercentage\":" + String(batPct) + ",";
  json += "\"batteryVoltage\":" + String(batVIn, 2);
  json += "},\"nodes\":{";
  
  json += "\"node_1\":{";
  json += "\"h\":" + String(n1h, 2) + ",";
  json += "\"d\":" + String(n1d, 2) + ",";
  json += "\"diff\":" + String(n1diff, 2) + ",";
  json += "\"hasImage\":" + String(node1.hasImage ? "true" : "false");
  json += "},\"node_2\":{";
  
  json += "\"h\":" + String(n2h, 2) + ",";
  json += "\"d\":" + String(n2d, 2) + ",";
  json += "\"diff\":" + String(n2diff, 2) + ",";
  json += "\"hasImage\":" + String(node2.hasImage ? "true" : "false");
  json += "}}}";

  server.send(200, "application/json", json);
}

void Network::handleImage() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  
  if (!server.hasArg("node")) {
    server.send(400, "text/plain", "Missing node parameter");
    return;
  }
  
  String nodeId = server.arg("node");
  NodeData* targetNode = nullptr;
  
  if (nodeId == "node_1") targetNode = &node1;
  else if (nodeId == "node_2") targetNode = &node2;
  
  if (!targetNode || !targetNode->hasImage || targetNode->imageSize == 0) {
    server.send(404, "text/plain", "Image not found");
    return;
  }

  WiFiClient client = server.client();
  server.sendHeader("Content-Length", String(targetNode->imageSize));
  server.send(200, "image/jpeg", "");
  client.write(targetNode->imageBuffer, targetNode->imageSize);
}

void Network::handleTrigger() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  
  if (!server.hasArg("node")) {
    server.send(400, "text/plain", "Missing node parameter");
    return;
  }
  
  String nodeId = server.arg("node");
  if (nodeId == "node_1") {
    node1.captureRequested = true;
    server.send(200, "application/json", "{\"status\":\"triggered\"}");
  } else if (nodeId == "node_2") {
    node2.captureRequested = true;
    server.send(200, "application/json", "{\"status\":\"triggered\"}");
  } else {
    server.send(400, "text/plain", "Invalid node parameter");
  }
}

void Network::handlePoll() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  
  if (!server.hasArg("node")) {
    server.send(400, "text/plain", "Missing node parameter");
    return;
  }
  
  String nodeId = server.arg("node");
  bool shouldTrigger = false;
  
  if (nodeId == "node_1") {
    shouldTrigger = node1.captureRequested;
    node1.captureRequested = false; // Reset after reading
  } else if (nodeId == "node_2") {
    shouldTrigger = node2.captureRequested;
    node2.captureRequested = false; // Reset after reading
  } else {
    server.send(400, "text/plain", "Invalid node parameter");
    return;
  }
  
  String json = "{";
  json += "\"trigger\":" + String(shouldTrigger ? "true" : "false");
  json += "}";
  
  server.send(200, "application/json", json);
}

void Network::handleClient() {
  server.handleClient();
}

void Network::sendMeasurement(const Measurement &m) {
  // Legacy function
  Serial.print("[Network] sendMeasurement() called - vIn=");
  Serial.print(m.vIn, 2);
  Serial.print(" V, percentage=");
  Serial.print(m.percentage);
  Serial.println("%");
}
