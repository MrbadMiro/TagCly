#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <TinyGPSPlus.h>
#include <ArduinoJson.h>
#include <driver/i2s.h>

// Wi-Fi credentials
const char* ssid = "Staff";
const char* password = "Staff@dcb7";

// MQTT settings
const char* mqtt_server = "10.10.2.64";
const int mqtt_port = 1883;
const char* mqtt_topic = "tagcly/pet/PET123/sensors";
const char* mqtt_user = "mqtt_user";
const char* mqtt_password = "mqtt_password";
const char* pet_id = "PET123";
const char* device_id = "ESP32_001";

// I2C Pins (shared between MPU6050 and MAX30205)
#define I2C_SDA 21  // D221
#define I2C_SCL 22  // D223

// INMP441 Microphone Pins
#define I2S_WS 25   // Word select
#define I2S_SCK 26  // Serial clock
#define I2S_SD 32   // Serial data (Note: You mentioned So-d223 but D32 is more common)

// GPS Pins
#define GPS_RX 16   // Connects to TX of NEO-6M
#define GPS_TX 17   // Connects to RX of NEO-6M

// Sensor objects
Adafruit_MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial SerialGPS(1); // UART1 for GPS
WiFiClient espClient;
PubSubClient client(espClient);

// Audio buffer
#define SAMPLE_SIZE 512
int32_t audioSamples[SAMPLE_SIZE];
int sampleIndex = 0;

// Step counter variables
int stepCount = 0;
float lastAccel = 0;
unsigned long lastStepTime = 0;
const unsigned long stepDebounce = 300; // ms

void setup() {
  Serial.begin(115200);
  SerialGPS.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  
  // Initialize I2C
  Wire.begin(I2C_SDA, I2C_SCL);
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  
  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050");
    while (1);
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  
  // Initialize I2S for microphone
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 44100,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 64
  };
  
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_in_num = I2S_SD,
    .data_out_num = I2S_PIN_NO_CHANGE
  };
  
  i2s_driver_install(I2S_NUM_0, &i2s_config, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pin_config);
  
  Serial.println("Initialization complete");
}

void setup_wifi() {
  delay(10);
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    
    if (client.connect(device_id, mqtt_user, mqtt_password)) {
      Serial.println("Connected to MQTT");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

String getTimestamp() {
  // Generate timestamp (you can implement NTP if needed)
  unsigned long currentMillis = millis();
  unsigned long seconds = currentMillis / 1000;
  unsigned long minutes = seconds / 60;
  unsigned long hours = minutes / 60;
  char timestamp[20];
  sprintf(timestamp, "%02d:%02d:%02d", hours % 24, minutes % 60, seconds % 60);
  return String(timestamp);
}

float readMAX30205Temperature() {
  // MAX30205 temperature reading implementation
  Wire.beginTransmission(0x48); // MAX30205 default address
  Wire.write(0x00); // Temperature register
  Wire.endTransmission();
  
  Wire.requestFrom(0x48, 2);
  if (Wire.available() >= 2) {
    uint8_t msb = Wire.read();
    uint8_t lsb = Wire.read();
    float temperature = (msb << 8) | lsb;
    temperature *= 0.00390625; // Convert to Celsius
    return temperature;
  }
  return -1;
}

void updateSteps(float accelMagnitude) {
  unsigned long now = millis();
  
  // Simple step detection algorithm
  if (accelMagnitude > 1.5 && lastAccel <= 1.5 && 
      (now - lastStepTime) > stepDebounce) {
    stepCount++;
    lastStepTime = now;
  }
  
  lastAccel = accelMagnitude;
}

float getActivityIntensity(float ax, float ay, float az) {
  // Calculate magnitude of acceleration vector
  float magnitude = sqrt(ax*ax + ay*ay + az*az);
  
  // Subtract gravity (1g) and constrain
  magnitude = max(0, magnitude - 1.0);
  
  // Scale to 0-10 range
  return constrain(magnitude * 3.0, 0, 10);
}

void readMicrophone() {
  size_t bytesRead = 0;
  i2s_read(I2S_NUM_0, &audioSamples[sampleIndex], sizeof(int32_t), &bytesRead, portMAX_DELAY);
  sampleIndex = (sampleIndex + 1) % SAMPLE_SIZE;
}

float calculateSoundLevel() {
  int32_t sum = 0;
  for (int i = 0; i < SAMPLE_SIZE; i++) {
    sum += abs(audioSamples[i]);
  }
  float average = sum / (float)SAMPLE_SIZE;
  return constrain(map(average, 0, 10000, 0, 100), 0, 100);
}

void processGPS() {
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Read sensors
  float temperature = readMAX30205Temperature();
  
  // Read accelerometer data
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  // Calculate activity metrics
  float accelMagnitude = sqrt(a.acceleration.x*a.acceleration.x + 
                           a.acceleration.y*a.acceleration.y + 
                           a.acceleration.z*a.acceleration.z);
  updateSteps(accelMagnitude);
  float activity_intensity = getActivityIntensity(a.acceleration.x, 
                                               a.acceleration.y, 
                                               a.acceleration.z);
  
  // Read microphone
  readMicrophone();
  float sound_level = calculateSoundLevel();
  
  // Process GPS data
  processGPS();
  float latitude = 0, longitude = 0;
  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
  }

  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["timestamp"] = getTimestamp();
  doc["pet_id"] = pet_id;
  doc["device_id"] = device_id;
  
  if (temperature != -1) {
    doc["temperature"] = round(temperature * 10) / 10.0; // 1 decimal place
  }
  
  doc["steps"] = stepCount;
  doc["activity_intensity"] = round(activity_intensity * 10) / 10.0; // 1 decimal place
  doc["sound_level"] = sound_level;
  
  if (gps.location.isValid()) {
    doc["latitude"] = latitude;
    doc["longitude"] = longitude;
  }
  
  doc["status"] = (temperature == -1 || !gps.location.isValid()) ? "error" : "ok";

  // Serialize JSON to buffer
  char buffer[512];
  serializeJson(doc, buffer);

  // Publish to MQTT
  if (client.publish(mqtt_topic, buffer)) {
    Serial.println("Data published:");
    Serial.println(buffer);
  } else {
    Serial.println("Failed to publish data");
  }

  // Sleep for 1 minute (adjust as needed)
  delay(60000);
}