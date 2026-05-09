#pragma once

#include <Arduino.h>

// Ultrasonic wiring (both Master and Slave):
// - Trig: GPIO 13
// - Echo: GPIO 12
// IMPORTANT: GPIO 12 is NOT 5V tolerant.
// If your ultrasonic Echo is 5V (e.g., HC-SR04), add a 1k/2k voltage divider BEFORE GPIO 12.
static constexpr uint8_t WATERLEVEL_TRIG_PIN = 13;
static constexpr uint8_t WATERLEVEL_ECHO_PIN = 12;
