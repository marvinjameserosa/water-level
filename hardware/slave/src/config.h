#pragma once

#include <Arduino.h>
#include <IPAddress.h>
#include "waterlevel_pins.h"

// ==============================================================================
// ⬇️⬇️⬇️ HIGHLIGHTED CONFIGURATION SECTION - EDIT THESE VALUES ⬇️⬇️⬇️
// ==============================================================================

// 1. Set the Device ID for this specific camera node (e.g., "node_1" or "node_2")
#define DEVICE_ID "node_1"

// 2. Pico 2W Master Access Point Credentials
namespace cfg {
  static constexpr const char* kApSsid = "waterlevel";
  static constexpr const char* kApPassword = ""; // Leave empty if the AP is open

  // 3. Distance Calculation Configuration
  static constexpr float kContainerDiameterCm = 10.4f;

  // 4. Static IPs assigned by Node ID
  inline IPAddress masterIp() { return IPAddress(192, 168, 4, 1); }
  inline IPAddress subnetMask() { return IPAddress(255, 255, 255, 0); }
  
  inline IPAddress getLocalIP() {
    if (String(DEVICE_ID) == "node_1") {
      return IPAddress(192, 168, 4, 2);
    } else {
      return IPAddress(192, 168, 4, 3);
    }
  }
}
// ==============================================================================
// ⬆️⬆️⬆️ END OF HIGHLIGHTED CONFIGURATION SECTION ⬆️⬆️⬆️
// ==============================================================================
