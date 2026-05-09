#include "NetworkManager.h"
#include "config.h"

void NetworkManager::begin() {
  Serial.print("Connecting to Master AP: ");
  Serial.println(cfg::kApSsid);
  
  WiFi.mode(WIFI_STA);

  IPAddress localIP = cfg::getLocalIP();
  IPAddress gateway = cfg::masterIp();
  IPAddress subnet = cfg::subnetMask();
  WiFi.config(localIP, gateway, subnet);

  WiFi.begin(cfg::kApSsid, cfg::kApPassword);
}

void NetworkManager::onStateRequest(StateCallback cb) {
  stateCallback_ = cb;
}

void NetworkManager::onImageRequest(ImageCallback captureCb, ReturnFrameCallback returnCb) {
  imageCallback_ = captureCb;
  returnFrameCallback_ = returnCb;
}

void NetworkManager::process() {
  maintainConnection();
  if (!isConnected()) return;

  unsigned long now = millis();
  
  // Poll master every 2 seconds for triggers
  if (now - lastPollMs_ >= 2000) {
    lastPollMs_ = now;
    pollMaster();
  }
  
  // Regular state upload every 10 seconds
  if (now - lastStateMs_ >= 10000) {
    lastStateMs_ = now;
    uploadToMaster(false);
  }
}

void NetworkManager::pollMaster() {
  HTTPClient http;
  String url = "http://192.168.4.1/api/poll?node=" + String(DEVICE_ID);
  http.begin(url);
  
  int httpCode = http.GET();
  if (httpCode == 200) {
    String payload = http.getString();
    if (payload.indexOf("\"trigger\":true") > 0 || payload.indexOf("\"trigger\": true") > 0) {
      Serial.println("Trigger received from Master!");
      uploadToMaster(true);
    }
  }
  http.end();
}

void NetworkManager::uploadToMaster(bool includeImage) {
  if (!stateCallback_) return;
  
  float h = 0, d = 0, diff = 0;
  stateCallback_(h, d, diff);
  
  if (isnan(h)) h = 0.0;
  if (isnan(d)) d = 0.0;
  if (isnan(diff)) diff = 0.0;

  HTTPClient http;
  String url = "http://192.168.4.1/api/upload?node=" + String(DEVICE_ID);
  url += "&h=" + String(h, 2) + "&d=" + String(d, 2) + "&diff=" + String(diff, 2);
  
  http.begin(url);
  
  int httpCode = -1;
  if (includeImage && imageCallback_ && returnFrameCallback_) {
    camera_fb_t* fb = imageCallback_();
    if (fb) {
      http.addHeader("Content-Type", "image/jpeg");
      httpCode = http.POST(fb->buf, fb->len);
      returnFrameCallback_(fb);
    } else {
      httpCode = http.POST(""); // Failed to capture, just send state
    }
  } else {
    httpCode = http.POST(""); // Just send state
  }

  if (httpCode > 0) {
    Serial.printf("Uploaded to master. Response code: %d\n", httpCode);
  } else {
    Serial.printf("Upload failed, error: %s\n", http.errorToString(httpCode).c_str());
  }
  http.end();
}

void NetworkManager::maintainConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    unsigned long now = millis();
    if (now - lastReconnectMs_ >= 5000) {
      lastReconnectMs_ = now;
      Serial.println("WiFi not connected. Attempting to reconnect...");
      WiFi.disconnect();
      WiFi.begin(cfg::kApSsid, cfg::kApPassword);
    }
  }
}

bool NetworkManager::isConnected() const {
  return WiFi.status() == WL_CONNECTED;
}
