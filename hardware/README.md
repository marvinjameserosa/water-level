# Hardware (ESP32-CAM)

This repo now contains two separate PlatformIO projects:

- `hardware/master` — ESP32-CAM Master (Wi-Fi AP + API for Slave + posts combined levels to dashboard)
- `hardware/slave` — ESP32-CAM Slave (connects to Master AP + posts its level to Master)

Shared code lives in:

- `hardware/common/lib/Ultrasonic` — ultrasonic sensor class used by both projects
- `hardware/common/include` — shared pin mappings (includes the GPIO12 voltage divider reminder)

## Build

From each folder:

- Master: `cd hardware/master` then `pio run -t upload`
- Slave: `cd hardware/slave` then `pio run -t upload`
