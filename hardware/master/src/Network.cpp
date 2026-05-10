#include "Network.h"

Network::Network() : server(80), _battery(nullptr) {}

void Network::begin(Battery* battery) {
    _battery = battery;
    
    setupAP();
    setupRoutes();
    server.begin();
    
    Serial.println("[Network] AP & System Voltage API started.");
}

void Network::setupAP() {
    WiFi.persistent(false);
    WiFi.mode(WIFI_AP);

    IPAddress localIp(192, 168, 4, 1);
    IPAddress gateway(192, 168, 4, 1);
    IPAddress subnet(255, 255, 255, 0);
    WiFi.softAPConfig(localIp, gateway, subnet);

    if (WiFi.softAP("waterlevel")) {
        Serial.print("[Network] AP Ready. Gateway IP: ");
        Serial.println(WiFi.softAPIP());
    } else {
        Serial.println("[Network] ERROR: Failed to set up AP");
    }
}

void Network::setupRoutes() {
    server.on("/api/state", HTTP_GET, std::bind(&Network::handleState, this));
    server.on("/api/state", HTTP_OPTIONS, std::bind(&Network::handleOptions, this));
}

void Network::handleOptions() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204); // 204 No Content is the standard response for OPTIONS
}

void Network::handleState() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    
    Measurement m = {0, 0, 0};
    if (_battery) {
        m = _battery->read();
    }

    float batVIn = isnan(m.vIn) ? 0.0 : m.vIn;
    int batPct = m.percentage;

    String json = "{";
    json += "\"system\":{";
    json += "\"percentage\":" + String(batPct) + ",";
    json += "\"voltage\":" + String(batVIn, 2);
    json += "}";
    json += "}";

    server.send(200, "application/json", json);
}

void Network::handleClient() {
    server.handleClient();
}