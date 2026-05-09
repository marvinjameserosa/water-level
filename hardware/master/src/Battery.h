#pragma once
#include <Arduino.h>

struct Measurement {
  float vOut;
  float vIn;
  int percentage;
};

class Battery {
public:
  Battery();
  void begin(uint8_t analogPin);
  Measurement read();
  bool isWarmingUp() const;

private:
  uint8_t _pin;
  int _warmupCount;
};
