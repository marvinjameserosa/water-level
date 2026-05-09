#include <Arduino.h>
#include "config.h"
#include "CameraManager.h"
#include "NetworkManager.h"
#include "Ultrasonic.h"

CameraManager cameraManager;
NetworkManager networkManager;
Ultrasonic ultrasonic(WATERLEVEL_TRIG_PIN, WATERLEVEL_ECHO_PIN);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  ultrasonic.begin();
  cameraManager.begin();
  networkManager.begin();
  
  networkManager.onStateRequest([](float& h, float& d, float& diff) {
    h = ultrasonic.readDistanceCm(3, 20);
    d = cfg::kContainerDiameterCm;
    
    if (isfinite(h)) {
      diff = fabsf(h - d);
    } else {
      diff = 0;
    }
  });

  networkManager.onImageRequest(
    []() -> camera_fb_t* {
      Serial.println("Received /api/image trigger from dashboard.");
      return cameraManager.capture();
    },
    [](camera_fb_t* fb) {
      if (fb) {
        cameraManager.returnFrame(fb);
      }
    }
  );

  Serial.println("Slave Node Initialized and listening for commands.");
}

void loop() {
  networkManager.process();
}
