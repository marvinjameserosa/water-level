#include "Ultrasonic.h"

Ultrasonic::Ultrasonic(uint8_t trigPin, uint8_t echoPin, unsigned long timeoutUs)
    : trigPin_(trigPin), echoPin_(echoPin), timeoutUs_(timeoutUs) {}

void Ultrasonic::begin() {
  pinMode(trigPin_, OUTPUT);
  pinMode(echoPin_, INPUT);

  digitalWrite(trigPin_, LOW);
}

float Ultrasonic::readDistanceOnceCm() {
  // Trigger pulse: LOW -> HIGH (10us) -> LOW
  digitalWrite(trigPin_, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin_, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin_, LOW);

  const unsigned long durationUs = pulseIn(echoPin_, HIGH, timeoutUs_);
  if (durationUs == 0) {
    return NAN;
  }

  // HC-SR04-ish conversion: distance(cm) = duration(us) / 58
  return static_cast<float>(durationUs) / 58.0f;
}

float Ultrasonic::readDistanceCm(uint8_t samples, uint16_t sampleDelayMs) {
  if (samples == 0) {
    return readDistanceOnceCm();
  }

  float sum = 0.0f;
  uint8_t good = 0;

  for (uint8_t i = 0; i < samples; i++) {
    const float d = readDistanceOnceCm();
    if (!isnan(d) && d > 0.0f) {
      sum += d;
      good++;
    }

    if (i + 1 < samples) {
      delay(sampleDelayMs);
    }
  }

  if (good == 0) {
    return NAN;
  }

  return sum / static_cast<float>(good);
}
