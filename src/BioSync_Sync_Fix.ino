#include <WiFi.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <Adafruit_Fingerprint.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>

/*
  BioSync ESP32 + R307 + SH1106/SH1107 OLED + Supabase

  Implemented here:
  - enrollment through Serial Monitor (one-time person details + two scans)
  - duplicate fingerprint detection before storing a new template
  - local identity cache in ESP32 NVS, for offline recognition
  - automatic attendance recognition
  - offline attendance queue, uploaded when Wi-Fi returns
  - serial command: DELETE <numeric fingerprint ID>
  - role normalization to Student / Staff / Admin

  Important:
  - Dashboard-side delete buttons cannot directly execute from this .ino alone.
    A dashboard/API command queue must be added separately to send delete requests
    to this device. This firmware supports the device-side delete operation by Serial.
  - Attendance inserts below assume attendance table columns:
      person_id (UUID FK to people.id), date, check_in_time, status
    and that the people row's id is returned when enrollment inserts successfully.
  - Never put a Supabase service_role/secret key in device firmware. Use only the
    publishable/anon key and suitable RLS policies.
*/

// ---------- DEVICE SETTINGS ----------
const char* WIFI_SSID = "nithis";
const char* WIFI_PASSWORD = "shreeya18";

const char* SUPABASE_URL = "https://xirtexwucvluqqsoklzc.supabase.co";
const char* SUPABASE_KEY = "sb_publishable_bl_gdpQ-ZXMRd5MSWi-CHQ_F5ABj5rC";
const char* PEOPLE_PATH = "/rest/v1/people";
const char* ATTENDANCE_PATH = "/rest/v1/attendance";

// Existing wiring: ESP32 RX2=GPIO16 receives sensor TX; TX2=GPIO17 sends to sensor RX.
HardwareSerial fingerprintSerial(2);
Adafruit_Fingerprint finger(&fingerprintSerial);
Adafruit_SH1106G display(128, 64, &Wire, -1);
Preferences prefs;

// Set this to the next free ID on your existing R307 if needed.
// The firmware checks for duplicates, but does not erase existing sensor templates.
int currentFingerprintID = 4;
const int MAX_FINGERPRINT_ID = 127;
const unsigned long WIFI_RETRY_INTERVAL_MS = 15000;
const unsigned long ATTENDANCE_COOLDOWN_MS = 10000;
unsigned long lastWifiAttempt = 0;
unsigned long lastAttendanceAt = 0;
int lastAttendanceFingerprint = -1;
bool enrollModeActive = false;  // Start idle; enrollment begins only after the ENROLL command.

String employeeID, personName, personEmail, personPhone, personRole, personDepartment;

// ---------- OLED ----------
void showMessage(String a, String b = "", String c = "") {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println(a);
  display.println(b);
  display.println(c);
  display.display();
}

String readLineBlocking(const char* prompt) {
  Serial.println(prompt);
  while (!Serial.available()) delay(20);
  String value = Serial.readStringUntil('\n');
  value.trim();
  return value;
}

String jsonEscape(String s) {
  s.replace("\\", "\\\\");
  s.replace("\"", "\\\"");
  s.replace("\n", "\\n");
  s.replace("\r", "\\r");
  return s;
}

String normalizeRole(String role) {
  role.trim();
  role.toLowerCase();
  if (role == "student") return "Student";
  if (role == "staff") return "Staff";
  if (role == "admin") return "Admin";
  return "";
}

String keyFor(int id, String suffix) { return "p" + String(id) + "_" + suffix; }

void saveLocalPerson(int fpID, String empID, String name, String email,
                     String phone, String role, String dept, String personUuid) {
  prefs.begin("biosync", false);
  prefs.putString(keyFor(fpID, "emp").c_str(), empID);
  prefs.putString(keyFor(fpID, "name").c_str(), name);
  prefs.putString(keyFor(fpID, "email").c_str(), email);
  prefs.putString(keyFor(fpID, "phone").c_str(), phone);
  prefs.putString(keyFor(fpID, "role").c_str(), role);
  prefs.putString(keyFor(fpID, "dept").c_str(), dept);
  prefs.putString(keyFor(fpID, "uuid").c_str(), personUuid);
  prefs.putInt("next_fp", max(currentFingerprintID, fpID + 1));
  prefs.end();
}

bool loadLocalPerson(int fpID, String &empID, String &name, String &email,
                     String &phone, String &role, String &dept, String &personUuid) {
  prefs.begin("biosync", true);
  empID = prefs.getString(keyFor(fpID, "emp").c_str(), "");
  name = prefs.getString(keyFor(fpID, "name").c_str(), "");
  email = prefs.getString(keyFor(fpID, "email").c_str(), "");
  phone = prefs.getString(keyFor(fpID, "phone").c_str(), "");
  role = prefs.getString(keyFor(fpID, "role").c_str(), "");
  dept = prefs.getString(keyFor(fpID, "dept").c_str(), "");
  personUuid = prefs.getString(keyFor(fpID, "uuid").c_str(), "");
  prefs.end();
  return empID.length() > 0 && name.length() > 0;
}

void deleteLocalPerson(int fpID) {
  prefs.begin("biosync", false);
  prefs.remove(keyFor(fpID, "emp").c_str());
  prefs.remove(keyFor(fpID, "name").c_str());
  prefs.remove(keyFor(fpID, "email").c_str());
  prefs.remove(keyFor(fpID, "phone").c_str());
  prefs.remove(keyFor(fpID, "role").c_str());
  prefs.remove(keyFor(fpID, "dept").c_str());
  prefs.remove(keyFor(fpID, "uuid").c_str());
  prefs.end();
}

String getLocalUuid(int fpID) {
  prefs.begin("biosync", true);
  String result = prefs.getString(keyFor(fpID, "uuid").c_str(), "");
  prefs.end();
  return result;
}

// ---------- WIFI / HTTP ----------
void keepWifiConnected() {
  if (WiFi.status() == WL_CONNECTED) return;
  if (millis() - lastWifiAttempt < WIFI_RETRY_INTERVAL_MS) return;
  lastWifiAttempt = millis();
  Serial.println("Wi-Fi disconnected; retrying in background...");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void addSupabaseHeaders(HTTPClient &http, bool json = false) {
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);
  if (json) http.addHeader("Content-Type", "application/json");
}

String extractJsonString(String json, String key) {
  String token = "\"" + key + "\":\"";
  int start = json.indexOf(token);
  if (start < 0) return "";
  start += token.length();
  int end = json.indexOf('"', start);
  if (end < 0) return "";
  return json.substring(start, end);
}

bool uploadPersonToSupabase(int fpID, String &personUuid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("No Wi-Fi; profile saved locally only. It will need later sync.");
    return false;
  }

  HTTPClient http;
  String url = String(SUPABASE_URL) + PEOPLE_PATH;
  if (!http.begin(url)) return false;
  addSupabaseHeaders(http, true);
  http.addHeader("Prefer", "return=representation");

  String payload = "{";
  payload += "\"employee_id\":\"" + jsonEscape(employeeID) + "\",";
  payload += "\"name\":\"" + jsonEscape(personName) + "\",";
  payload += "\"email\":\"" + jsonEscape(personEmail) + "\",";
  payload += "\"phone\":" + (personPhone.length() ? "\"" + jsonEscape(personPhone) + "\"" : "null") + ",";
  payload += "\"role\":\"" + jsonEscape(personRole) + "\",";
  payload += "\"department\":\"" + jsonEscape(personDepartment) + "\",";
  payload += "\"biometric_id\":\"BIO-" + String(fpID) + "\"}";

  int code = http.POST(payload);
  String response = http.getString();
  http.end();
  Serial.printf("Supabase people insert HTTP %d\n", code);
  if (code >= 200 && code < 300) {
    personUuid = extractJsonString(response, "id");
    if (personUuid.length()) Serial.println("Supabase person UUID cached.");
    return true;
  }
  Serial.println(response);
  return false;
}

// ---------- OFFLINE ATTENDANCE QUEUE ----------
// Queue records are stored in ESP32 NVS. Maximum 20 pending entries to avoid filling flash.
int pendingAttendanceCount() {
  prefs.begin("biosync", true);
  int n = prefs.getInt("att_count", 0);
  prefs.end();
  return n;
}

void queueAttendance(String personUuid, String empID, String name, int fpID, String dateValue, String timeValue) {
  prefs.begin("biosync", false);
  int n = prefs.getInt("att_count", 0);
  if (n >= 20) {
    Serial.println("WARNING: Offline attendance queue is full; this mark was not queued.");
    prefs.end();
    return;
  }
  String prefix = "att" + String(n) + "_";
  prefs.putString((prefix + "uuid").c_str(), personUuid);
  prefs.putString((prefix + "emp").c_str(), empID);
  prefs.putString((prefix + "name").c_str(), name);
  prefs.putInt((prefix + "fp").c_str(), fpID);
  prefs.putString((prefix + "date").c_str(), dateValue);
  prefs.putString((prefix + "time").c_str(), timeValue);
  prefs.putInt("att_count", n + 1);
  prefs.end();
  Serial.println("Attendance queued locally.");
}

String lookupPersonUuidInSupabase(int fpID) {
  if (WiFi.status() != WL_CONNECTED) return "";

  HTTPClient http;
  String url = String(SUPABASE_URL) + PEOPLE_PATH +
               "?biometric_id=eq.BIO-" + String(fpID) + "&select=id&limit=1";
  if (!http.begin(url)) {
    Serial.println("SYNC: Could not start Supabase people lookup.");
    return "";
  }
  addSupabaseHeaders(http, false);
  int code = http.GET();
  String response = http.getString();
  http.end();

  Serial.printf("SYNC: Person lookup HTTP %d\\n", code);
  if (code < 200 || code >= 300) {
    Serial.println(response);
    return "";
  }
  return extractJsonString(response, "id");
}

bool uploadAttendanceRecord(String personUuid, String empID, String name, int fpID, String dateValue, String timeValue) {
  if (WiFi.status() != WL_CONNECTED || personUuid.length() == 0) return false;
  if (!dateValue.length() || !timeValue.length()) {
    struct tm timeinfo;
    if (!getLocalTime(&timeinfo, 1500)) {
      configTime(0, 0, "pool.ntp.org", "time.nist.gov");
      if (!getLocalTime(&timeinfo, 3000)) {
        Serial.println("Clock not synchronized; keeping attendance in local queue.");
        return false;
      }
    }
    char dateBuf[11], timeBuf[25];
    strftime(dateBuf, sizeof(dateBuf), "%Y-%m-%d", &timeinfo);
    strftime(timeBuf, sizeof(timeBuf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    dateValue = String(dateBuf);
    timeValue = String(timeBuf);
  }

  HTTPClient http;
  String url = String(SUPABASE_URL) + ATTENDANCE_PATH;
  if (!http.begin(url)) return false;
  addSupabaseHeaders(http, true);
  http.addHeader("Prefer", "return=minimal");
  String payload = "{\"person_id\":\"" + jsonEscape(personUuid) + "\",\"date\":\"" + jsonEscape(dateValue) + "\",\"check_in_time\":\"" + jsonEscape(timeValue) + "\",\"status\":\"Present\"}";
  int code = http.POST(payload);
  String response = http.getString();
  http.end();
  Serial.printf("Attendance upload HTTP %d\n", code);
  if (code >= 200 && code < 300) return true;
  Serial.println(response);
  return false;
}

void syncPendingAttendance() {
  if (WiFi.status() != WL_CONNECTED) return;
  // Process oldest item first; shift remaining entries after successful upload.
  while (true) {
    prefs.begin("biosync", true);
    int n = prefs.getInt("att_count", 0);
    if (n <= 0) { prefs.end(); return; }
    String prefix = "att0_";
    String uuid = prefs.getString((prefix + "uuid").c_str(), "");
    String emp = prefs.getString((prefix + "emp").c_str(), "");
    String name = prefs.getString((prefix + "name").c_str(), "");
    String dateValue = prefs.getString((prefix + "date").c_str(), "");
    String timeValue = prefs.getString((prefix + "time").c_str(), "");
    int fp = prefs.getInt((prefix + "fp").c_str(), 0);
    prefs.end();

    if (uuid.length() == 0) {
      Serial.println("SYNC: Queue item has no person UUID; looking up BIO-" + String(fp) + " in Supabase...");
      uuid = lookupPersonUuidInSupabase(fp);
      if (uuid.length() == 0) {
        Serial.println("SYNC FAILED: No matching cloud profile found for BIO-" + String(fp) +
                       ". Check Wi-Fi and confirm this person exists in Supabase people.");
        return;
      }
      prefs.begin("biosync", false);
      prefs.putString("att0_uuid", uuid);
      prefs.end();
    }

    if (!uploadAttendanceRecord(uuid, emp, name, fp, dateValue, timeValue)) {
      Serial.println("SYNC FAILED: Attendance upload failed. Check the HTTP status above, Supabase RLS, and attendance table columns.");
      return;
    }

    prefs.begin("biosync", false);
    for (int i = 1; i < n; i++) {
      String from = "att" + String(i) + "_";
      String to = "att" + String(i - 1) + "_";
      prefs.putString((to + "uuid").c_str(), prefs.getString((from + "uuid").c_str(), ""));
      prefs.putString((to + "emp").c_str(), prefs.getString((from + "emp").c_str(), ""));
      prefs.putString((to + "name").c_str(), prefs.getString((from + "name").c_str(), ""));
      prefs.putString((to + "date").c_str(), prefs.getString((from + "date").c_str(), ""));
      prefs.putString((to + "time").c_str(), prefs.getString((from + "time").c_str(), ""));
      prefs.putInt((to + "fp").c_str(), prefs.getInt((from + "fp").c_str(), 0));
    }
    String last = "att" + String(n - 1) + "_";
    prefs.remove((last + "uuid").c_str());
    prefs.remove((last + "emp").c_str());
    prefs.remove((last + "name").c_str());
    prefs.remove((last + "date").c_str());
    prefs.remove((last + "time").c_str());
    prefs.remove((last + "fp").c_str());
    prefs.putInt("att_count", n - 1);
    prefs.end();
    Serial.println("Queued attendance synced.");
  }
}

// ---------- FINGERPRINT ID HELPERS ----------
int findNextID() {
  prefs.begin("biosync", true);
  int remembered = prefs.getInt("next_fp", currentFingerprintID);
  prefs.end();
  if (remembered >= 1 && remembered <= MAX_FINGERPRINT_ID) currentFingerprintID = remembered;

  // Try IDs from remembered value upward. The R307 store command is the final collision guard.
  for (int id = currentFingerprintID; id <= MAX_FINGERPRINT_ID; id++) {
    uint8_t result = finger.loadModel(id);
    if (result != FINGERPRINT_OK) return id;
  }
  for (int id = 1; id < currentFingerprintID; id++) {
    uint8_t result = finger.loadModel(id);
    if (result != FINGERPRINT_OK) return id;
  }
  return -1;
}

int scanImageToBuffer(uint8_t bufferNumber) {
  showMessage("Place finger", "on sensor", "Waiting...");
  Serial.println("Place finger on R307...");
  uint8_t p;
  do { p = finger.getImage(); delay(40); } while (p != FINGERPRINT_OK);
  return finger.image2Tz(bufferNumber);
}

bool waitFingerRemoved() {
  showMessage("Remove finger", "Please wait");
  Serial.println("Remove finger...");
  unsigned long start = millis();
  while (millis() - start < 15000) {
    if (finger.getImage() == FINGERPRINT_NOFINGER) return true;
    delay(100);
  }
  return false;
}

// ---------- ENROLLMENT ----------
void enrollOnePerson() {
  Serial.println("\n=== NEW ENROLLMENT ===");
  employeeID = readLineBlocking("Enter Employee ID:");
  if (!employeeID.length()) { Serial.println("Employee ID is required."); return; }
  personName = readLineBlocking("Enter full name:");
  if (!personName.length()) { Serial.println("Name is required."); return; }
  personEmail = readLineBlocking("Enter email (or leave blank):");
  personPhone = readLineBlocking("Enter phone (or leave blank):");
  String roleInput = readLineBlocking("Enter role exactly Student, Staff, or Admin:");
  personRole = normalizeRole(roleInput);
  if (!personRole.length()) { Serial.println("Invalid role. Enrollment cancelled."); showMessage("Invalid role", "Use Student/Staff/Admin"); delay(1800); return; }
  personDepartment = readLineBlocking("Enter department:");

  int id = findNextID();
  if (id < 1) { showMessage("Sensor full", "No free ID"); Serial.println("No free fingerprint ID found."); return; }
  currentFingerprintID = id;
  Serial.println("Fingerprint ID allocated: " + String(id));

  if (scanImageToBuffer(1) != FINGERPRINT_OK) {
    showMessage("Scan failed", "Try again"); Serial.println("Could not process first scan."); return;
  }

  // Check the first scan against templates already stored in R307 before enrolling.
  uint8_t searchResult = finger.fingerFastSearch();
  if (searchResult == FINGERPRINT_OK) {
    int matchedID = finger.fingerID;
    String e, n, em, ph, r, d, uuid;
    if (loadLocalPerson(matchedID, e, n, em, ph, r, d, uuid)) {
      showMessage("Fingerprint exists", n, "Already enrolled");
      Serial.println("DUPLICATE FINGERPRINT: " + n + " (BIO-" + String(matchedID) + ")");
    } else {
      showMessage("Fingerprint exists", "Sensor ID " + String(matchedID), "Profile not cached");
      Serial.println("DUPLICATE FINGERPRINT: sensor template ID " + String(matchedID) + ", but no local name mapping exists.");
    }
    delay(2500);
    return;
  }

  if (!waitFingerRemoved()) { Serial.println("Timed out waiting for finger removal."); return; }
  if (scanImageToBuffer(2) != FINGERPRINT_OK) { showMessage("Second scan failed"); Serial.println("Could not process second scan."); return; }
  if (finger.createModel() != FINGERPRINT_OK) { showMessage("Finger mismatch", "Try same finger"); Serial.println("ERROR: scans did not match."); delay(1800); return; }
  if (finger.storeModel(id) != FINGERPRINT_OK) { showMessage("Store failed", "ID " + String(id)); Serial.println("ERROR: could not store template. Check if ID already exists."); delay(1800); return; }

  String personUuid = "";
  // Save offline identity first so the device can still recognize this person without Wi-Fi.
  saveLocalPerson(id, employeeID, personName, personEmail, personPhone, personRole, personDepartment, "");
  bool uploaded = uploadPersonToSupabase(id, personUuid);
  if (uploaded && personUuid.length()) {
    saveLocalPerson(id, employeeID, personName, personEmail, personPhone, personRole, personDepartment, personUuid);
  }

  showMessage("Enrolled!", personName, "BIO-" + String(id));
  Serial.println("FINGERPRINT ENROLLED: " + personName + " | BIO-" + String(id));
  if (uploaded) Serial.println("Profile uploaded to Supabase.");
  else Serial.println("Profile stored on sensor + local ESP32 cache; cloud upload failed/not connected.");
  currentFingerprintID = id + 1;
  prefs.begin("biosync", false); prefs.putInt("next_fp", currentFingerprintID); prefs.end();
  delay(2200);
}

// ---------- ATTENDANCE ----------
void markAttendance(int fpID) {
  if (millis() - lastAttendanceAt < ATTENDANCE_COOLDOWN_MS && fpID == lastAttendanceFingerprint) return;
  lastAttendanceAt = millis();
  lastAttendanceFingerprint = fpID;

  String emp, name, email, phone, role, dept, uuid;
  if (!loadLocalPerson(fpID, emp, name, email, phone, role, dept, uuid)) {
    showMessage("FINGERPRINT", "UNKNOWN", "No local profile");
    Serial.println("FINGERPRINT UNKNOWN: ID " + String(fpID));
    delay(1800);
    return;
  }

  showMessage(name + " VERIFIED", "Attendance marked", emp);
  Serial.println("================================");
  Serial.println(name + " VERIFIED");
  Serial.println("Employee ID: " + emp);
  Serial.println("Biometric ID: BIO-" + String(fpID));
  Serial.println("Attendance: PRESENT");

  String dateValue = "", timeValue = "";
  struct tm scanTime;
  if (getLocalTime(&scanTime, 1000)) {
    char dateBuf[11], timeBuf[25];
    strftime(dateBuf, sizeof(dateBuf), "%Y-%m-%d", &scanTime);
    strftime(timeBuf, sizeof(timeBuf), "%Y-%m-%dT%H:%M:%SZ", &scanTime);
    dateValue = String(dateBuf);
    timeValue = String(timeBuf);
  }
  if (uuid.length() && uploadAttendanceRecord(uuid, emp, name, fpID, dateValue, timeValue)) {
    Serial.println("Attendance saved to Supabase.");
  } else {
    queueAttendance(uuid, emp, name, fpID, dateValue, timeValue);
    Serial.println("Attendance saved locally; cloud sync pending.");
  }
  delay(1800);
}

void attendanceLoop() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK) { delay(60); return; }
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) { delay(200); return; }
  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) markAttendance(finger.fingerID);
  else {
    showMessage("FINGERPRINT", "UNKNOWN");
    Serial.println("FINGERPRINT UNKNOWN - attendance not marked.");
    delay(1000);
  }
  while (finger.getImage() != FINGERPRINT_NOFINGER) delay(100);
  showMessage("ATTENDANCE MODE", "Place finger");
}

// ---------- DEVICE-SIDE DELETE ----------
bool deleteFingerprint(int fpID) {
  if (fpID < 1 || fpID > MAX_FINGERPRINT_ID) return false;
  uint8_t result = finger.deleteModel(fpID);
  if (result != FINGERPRINT_OK) {
    Serial.println("R307 delete failed for ID " + String(fpID) + ". Sensor result=" + String(result));
    return false;
  }
  deleteLocalPerson(fpID);
  showMessage("Fingerprint", "deleted", "ID " + String(fpID));
  Serial.println("Deleted R307 template and local mapping for BIO-" + String(fpID));
  Serial.println("NOTE: Delete the matching people row from the dashboard/Supabase separately.");
  delay(1800);
  return true;
}

void handleSerialCommands() {
  if (!Serial.available()) return;
  String cmd = Serial.readStringUntil('\n');
  cmd.trim();
  String upper = cmd; upper.toUpperCase();
  if (upper == "ENROLL") {
    enrollModeActive = false;  // Do not leave the loop in automatic/repeating enrollment mode.
    Serial.println("Enrollment command received.");
    enrollOnePerson();         // Run one enrollment only, then return to command waiting.
    showMessage("BIOSYNC READY", "Type command");
    Serial.println("Ready. Type ENROLL or ATTENDANCE.");
  } else if (upper == "ATTENDANCE") {
    enrollModeActive = true;   // In this firmware, true means attendance scanning is active.
    showMessage("ATTENDANCE MODE", "Place finger");
    Serial.println("Attendance mode selected. Place a registered finger.");
  } else if (upper == "STOP" || upper == "STOP ATTENDANCE" || upper == "IDLE") {
    enrollModeActive = false;
    showMessage("BIOSYNC READY", "Attendance stopped");
    Serial.println("Attendance stopped. Device is idle; type ENROLL or ATTENDANCE.");
  } else if (upper.startsWith("DELETE ")) {
    int id = cmd.substring(7).toInt();
    if (!id) Serial.println("Usage: DELETE <numeric fingerprint ID>, e.g. DELETE 3");
    else deleteFingerprint(id);
  } else if (upper == "SYNC") {
    Serial.println("SYNC requested.");
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("SYNC: Wi-Fi is disconnected; attempting connection now...");
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      unsigned long syncStart = millis();
      while (WiFi.status() != WL_CONNECTED && millis() - syncStart < 12000) {
        delay(250);
      }
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("SYNC: Wi-Fi connected: " + WiFi.localIP().toString());
      syncPendingAttendance();
      Serial.println("SYNC attempt finished. Check messages above for any failure.");
    } else {
      Serial.println("SYNC FAILED: Wi-Fi still disconnected. Verify SSID/password and use a 2.4 GHz network.");
    }
  } else if (upper == "HELP") {
    Serial.println("Commands: ENROLL, ATTENDANCE, STOP (or STOP ATTENDANCE), IDLE, DELETE <numeric ID>, SYNC, HELP");
  } else {
    Serial.println("Unknown command. Type HELP.");
  }
}

// ---------- SETUP / LOOP ----------
void setup() {
  Serial.begin(115200);
  Serial.setTimeout(30000);
  delay(800);

  Wire.begin();
  display.begin(0x3C, true);
  display.setTextSize(1);
  display.setTextColor(SH110X_WHITE);
  showMessage("BioSync", "Starting...");

  fingerprintSerial.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);
  if (!finger.verifyPassword()) {
    showMessage("Sensor error", "Check R307 wiring");
    Serial.println("ERROR: R307 fingerprint sensor not detected. Check sensor power and TX/RX wiring.");
    while (true) delay(1000);
  }
  Serial.println("R307 fingerprint sensor detected.");

  prefs.begin("biosync", true);
  int remembered = prefs.getInt("next_fp", currentFingerprintID);
  prefs.end();
  if (remembered >= 1 && remembered <= MAX_FINGERPRINT_ID) currentFingerprintID = remembered;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  showMessage("Connecting Wi-Fi", "Can work offline");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) delay(250);
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wi-Fi connected: " + WiFi.localIP().toString());
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  } else {
    Serial.println("Wi-Fi not connected at startup. Offline recognition remains available for locally cached profiles.");
  }

  showMessage("BIOSYNC READY", "Type command");
  Serial.println("\nBIOSYNC READY");
  Serial.println("Type ENROLL to register one person, ATTENDANCE to automatically mark attendance, DELETE <ID> to remove a sensor template, SYNC to retry queued attendance, or HELP.");
  Serial.println("Initial mode: IDLE (waiting for command).");
}

void loop() {
  keepWifiConnected();
  handleSerialCommands();
  syncPendingAttendance();

  // Idle by default. Enrollment runs only when ENROLL is received.
  // Attendance scanning runs continuously only after ATTENDANCE is received.
  if (enrollModeActive) {
    attendanceLoop();
  }
  delay(20);
}
