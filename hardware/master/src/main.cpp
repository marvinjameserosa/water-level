#include <Arduino.h>
#include "Battery.h"
#include "Network.h"

const int voltagePin = 26;

Battery battery;
Network network;

void setup() {
    Serial.begin(115200);
    delay(2000); 
    Serial.println("Starting Master Node...");
    
    battery.begin(voltagePin);
    
    // Inject the battery object into the network so it can read the voltage
    network.begin(&battery); 
}

void loop() {
    // The server constantly listens for the dashboard's GET requests
    network.handleClient(); 
}