#include "Battery.h"

// --- VOLTAGE CONFIGURATION ---
static const float R1 = 200000.0;
static const float R2 = 100000.0;
static const float V_REF = 3.3;
static const float CALIBRATION_FACTOR = 1.054;

// --- BATTERY CONFIGURATION (2S LiPo) ---
static const float BATTERY_MAX_V = 8.4;
static const float BATTERY_MIN_V = 6.4;

// --- SAMPLING & WARMUP CONFIGURATION ---
static const int NUM_SAMPLES = 50;
static const int WARMUP_READINGS = 3;

Battery::Battery() : _pin(0), _warmupCount(0) {}

void Battery::begin(uint8_t analogPin) {
  _pin = analogPin;
  analogReadResolution(12);
}

Measurement Battery::read() {
  long totalADC = 0;
  for (int i = 0; i < NUM_SAMPLES; i++) {
    totalADC += analogRead(_pin);
    delay(2);
  }

  float avgADC = (float)totalADC / NUM_SAMPLES;
  float base_vOut = (avgADC / 4095.0) * V_REF;
  float vOut = base_vOut * CALIBRATION_FACTOR;
  float vIn = vOut * ((R1 + R2) / R2);

  float rawPercentage = ((vIn - BATTERY_MIN_V) / (BATTERY_MAX_V - BATTERY_MIN_V)) * 100.0;
  int displayPercentage = constrain((int)rawPercentage, 0, 100);

  if (_warmupCount < WARMUP_READINGS) {
    _warmupCount++;
  }

  Measurement m;
  m.vOut = vOut;
  m.vIn = vIn;
  m.percentage = displayPercentage;
  return m;
}

bool Battery::isWarmingUp() const {
  return _warmupCount < WARMUP_READINGS;
}
