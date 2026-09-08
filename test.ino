// Raspberry Pi Pico / Pico W + Arduino IDE
// Ultrasonic: Trig GP2, Echo GP3
// AT42QT2120 touch controller: SDA/SCL use Pico's default I2C pins
// Touch controller reset: GP6, change/interrupt: GP7

#include <Arduino.h>
#include <Wire.h>
#include "AT42QT2120Touch.h"

AT42QT2120Touch touch;

#define TRIG_PIN 2
#define ECHO_PIN 3

constexpr uint8_t RESET_PIN = 6;
constexpr uint8_t CHANGE_PIN = 7;

unsigned long echo_time;
int touch_raw = 0;

bool keyStates[AT42QT2120_MAX_KEYS] = {false};

// Higher threshold = less sensitive. Try 45 or 60 if it still triggers too early.
const uint8_t TOUCH_THRESHOLD = 35;

// Higher value = needs more stable readings before it counts as touched.
const uint8_t TOUCH_DETECT_INTEGRATOR = 8;

void onTouchChanged(uint8_t key, bool pressed);

long readUltrasonic() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  echo_time = pulseIn(ECHO_PIN, HIGH, 30000);

  if (echo_time == 0) {
    return 999;
  }

  return echo_time * 0.0343f / 2.0f;
}

int readTouchScaled() {
  for (int i = 0; i < AT42QT2120_MAX_KEYS; i++) {
    if (keyStates[i]) {
      return 100;
    }
  }

  return 0;
}

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  if (!touch.begin(Wire, AT42QT2120_DEFAULT_ADDR, RESET_PIN, CHANGE_PIN)) {
    while (true) {
      digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
      delay(250);
    }
  }

  touch.writeRegister(11, TOUCH_DETECT_INTEGRATOR);

  for (uint8_t key = 0; key < AT42QT2120_MAX_KEYS; key++) {
    touch.writeRegister(16 + key, TOUCH_THRESHOLD);
  }

  touch.calibrate();

  touch.onChanged(onTouchChanged);
}

void loop() {
  touch.update();

  float distance = readUltrasonic();
  int distVal;

  if (distance >= 40.0f) {
    distVal = 100;
  } else if (distance <= 10.0f) {
    distVal = 0;
  } else {
    distVal = map(distance, 10.0f, 40.0f, 0.0f, 100.0f);
  }

  touch_raw = readTouchScaled();

  Serial.print(distVal);
  Serial.print(" ");
  Serial.println(touch_raw);

  delay(60);
}

void onTouchChanged(uint8_t key, bool pressed) {
  if (key >= AT42QT2120_MAX_KEYS) {
    return;
  }

  keyStates[key] = pressed;
}
