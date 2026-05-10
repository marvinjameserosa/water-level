#include "camera_handler.h"
#include "esp_camera.h"

// ==========================================
// CAMERA PINOUT (AI Thinker ESP32-CAM)
// ==========================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Resolution: UXGA (1600x1200), SVGA (800x600), VGA (640x480)
  // VGA or SVGA is highly recommended for fast, stable Wi-Fi transfer
  config.frame_size = FRAMESIZE_SVGA; 
  config.jpeg_quality = 12; // Lower number means higher quality (0-63)
  config.fb_count = 1;

  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("Camera initialization failed!");
  } else {
    Serial.println("Camera initialized successfully.");
  }
}

void handleCapture(WebServer& server) {
  Serial.println("Capture requested by Dashboard...");
  
  // ==========================================
  // THE FIX: FLUSH THE STALE FRAME
  // ==========================================
  // Grab a dummy frame that was sitting in the buffer and throw it away
  camera_fb_t * dummy_fb = esp_camera_fb_get();
  if (dummy_fb) {
    esp_camera_fb_return(dummy_fb); 
  }
  
  // A tiny delay allows the sensor exposure to adjust to the new lighting/angle
  delay(50); 

  // ==========================================
  // TAKE THE REAL PHOTO
  // ==========================================
  camera_fb_t * fb = esp_camera_fb_get();
  
  if (!fb) {
    Serial.println("Camera capture failed");
    server.send(500, "text/plain", "Camera capture failed");
    return;
  }

  // Set headers and exact length so Next.js knows when to stop waiting
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Connection", "close");
  server.setContentLength(fb->len);
  
  // Send HTTP 200 OK greeting
  server.send(200, "image/jpeg", "");
  
  // Stream the raw binary data in chunks to prevent Wi-Fi TX buffer crashes
  WiFiClient client = server.client();
  size_t fbLen = fb->len;
  size_t chunkSize = 2048; // Send 2KB at a time

  for (size_t i = 0; i < fbLen; i += chunkSize) {
    // If Next.js disconnects early, abort to save memory
    if (!client.connected()) {
      Serial.println("Warning: Next.js disconnected early.");
      break; 
    }
    
    // Calculate how many bytes are left to send in this chunk
    size_t toSend = (fbLen - i < chunkSize) ? (fbLen - i) : chunkSize;
    
    // Push the chunk into the socket
    client.write(fb->buf + i, toSend);
  }
  
  // Free the real frame from memory immediately
  esp_camera_fb_return(fb);
  Serial.println("Photo sent successfully.");
}
