#pragma once

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <functional>
#include "esp_camera.h"

// Callback for fetching ultrasonic data (returns height, distance, difference)
typedef std::function<void(float&, float&, float&)> StateCallback;

// Callback for fetching a camera frame
typedef std::function<camera_fb_t*(void)> ImageCallback;

// Callback to return the camera frame buffer
typedef std::function<void(camera_fb_t*)> ReturnFrameCallback;

class NetworkManager {
 public:
  void begin();
  void maintainConnection();
  bool isConnected() const;
  void process(); // Replaces handleClient
  
  void onStateRequest(StateCallback cb);
  void onImageRequest(ImageCallback captureCb, ReturnFrameCallback returnCb);

 private:
  unsigned long lastReconnectMs_ = 0;
  unsigned long lastPollMs_ = 0;
  unsigned long lastStateMs_ = 0;
  
  StateCallback stateCallback_ = nullptr;
  ImageCallback imageCallback_ = nullptr;
  ReturnFrameCallback returnFrameCallback_ = nullptr;

  void pollMaster();
  void uploadToMaster(bool includeImage);
};
