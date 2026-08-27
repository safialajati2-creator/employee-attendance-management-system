'use strict';
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const FILES = {
  employees: path.join(DATA_DIR, 'employees.json'),
  attendance: path.join(DATA_DIR, 'attendance.json'),
  audit_logs: path.join(DATA_DIR, 'audit_logs.json'),
  shifts: path.join(DATA_DIR, 'shifts.json'),
  settings: path.join(DATA_DIR, 'settings.json'),
  users: path.join(DATA_DIR, 'users.json'),
  holidays: path.join(DATA_DIR, 'holidays.json'),
};

class CorruptDataError extends Error {
  constructor(fileName) {
    super(`"${fileName}" veri dosyasi okunamadi veya bozuk. Veri kaybini onlemek icin dosya otomatik olarak duzeltilmedi. Lutfen data/backups klasorundeki bir yedekten geri yukleyin veya dosyayi elle kontrol edin.`);
    this.name = 'CorruptDataError';
    this.fileName = fileName;
  }
}

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  for (const key of Object.keys(FILES)) {
    const filePath = FILES[key];
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, key === 'settings' ? JSON.stringify({workStartTime:'09:00',workEndTime:'18:00',lateTolerance:10,overtimeStartTime:'18:00'}, null, 2) : '[]', 'utf8');
    }
  }
}

function getFilePath(key) {
  const filePath = FILES[key];
  if (!filePath) throw new Error(`Bilinmeyen veri dosyasi: ${key}`);
  return filePath;
}

function readData(key) {
  const filePath = getFilePath(key);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, key === 'settings' ? JSON.stringify({workStartTime:'09:00',workEndTime:'18:00',lateTolerance:10,overtimeStartTime:'18:00'}, null, 2) : '[]', 'utf8');
    return [];
  }
  let raw;
  try { raw = fs.readFileSync(filePath, 'utf8'); }
  catch { throw new CorruptDataError(path.basename(filePath)); }
  if (raw.trim() === '') return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Beklenen dizi degil');
    return parsed;
  } catch { throw new CorruptDataError(path.basename(filePath)); }
}

function writeData(key, data) {
  const filePath = getFilePath(key);
  if (!Array.isArray(data)) throw new Error('Kaydedilecek veri bir dizi (array) olmalidir.');
  const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  const fd = fs.openSync(tmpPath, 'w');
  try {
    fs.writeFileSync(fd, JSON.stringify(data, null, 2), 'utf8');
    fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
  fs.renameSync(tmpPath, filePath);
  return true;
}

function generateId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
function readShifts() { if (!fs.existsSync(FILES.shifts)) fs.writeFileSync(FILES.shifts, '[]'); return JSON.parse(fs.readFileSync(FILES.shifts,'utf8')); }
function writeShifts(data){ fs.writeFileSync(FILES.shifts, JSON.stringify(data,null,2),'utf8'); }
function readUsers() { return readData('users'); }
function readHolidays() { if (!fs.existsSync(FILES.holidays)) fs.writeFileSync(FILES.holidays, '[]'); return JSON.parse(fs.readFileSync(FILES.holidays,'utf8')); }
function writeHolidays(data){ fs.writeFileSync(FILES.holidays, JSON.stringify(data,null,2),'utf8'); }
function readSettings() {
  if (!fs.existsSync(FILES.settings)) fs.writeFileSync(FILES.settings, JSON.stringify({workStartTime:'09:00',workEndTime:'18:00',lateTolerance:10,overtimeStartTime:'18:00'}, null, 2));
  return JSON.parse(fs.readFileSync(FILES.settings,'utf8'));
}
function writeSettings(data) { fs.writeFileSync(FILES.settings, JSON.stringify(data,null,2),'utf8'); }

module.exports = { DATA_DIR, BACKUP_DIR, FILES, CorruptDataError, ensureStorage, readData, writeData, generateId, readSettings, readHolidays, writeHolidays, readUsers, readShifts, writeShifts, writeSettings };
