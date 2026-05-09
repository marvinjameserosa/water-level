#pragma once

#include <Arduino.h>
#include "esp_camera.h"

class CameraManager {
 public:
  void begin();
  camera_fb_t* capture();
  void returnFrame(camera_fb_t* fb);
};
