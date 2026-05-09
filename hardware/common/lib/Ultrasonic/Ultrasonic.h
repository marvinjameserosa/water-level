#pragma once

#include <Arduino.h>

class Ultrasonic {
 public:
  Ultrasonic(uint8_t trigPin, uint8_t echoPin, unsigned long timeoutUs = 30000);

  void begin();

  // Returns distance in centimeters.
  // Returns NAN if no echo was received within timeout.
  float readDistanceCm(uint8_t samples = 3, uint16_t sampleDelayMs = 20);

 private:
  uint8_t trigPin_;
  uint8_t echoPin_;
  unsigned long timeoutUs_;

  float readDistanceOnceCm();
};
