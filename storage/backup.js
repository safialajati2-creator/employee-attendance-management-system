'use strict';

/*
 * backup.js
 * JSON dosyalari icin yedekleme sistemi.
 * - Onemli degisikliklerden once otomatik yedek
 * - data/backups/ altinda zaman damgali klasorler
 * - Yedek olusturma ve yedekten geri yukleme
 */

const fs = require('fs');
const path = require('path');
const { DATA_DIR, BACKUP_DIR } = require('./fileStorage');

const BACKUP_TARGETS = [
  'employees.json',
  'attendance.json',
  'audit_logs.json',
  'shifts.json',
  'settings.json',
  'holidays.json',
];

function timestampName() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_` +
    `${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-${String(d.getMilliseconds()).padStart(3, '0')}`
  );
}

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function createBackup(label) {
  ensureBackupDir();
  const folderName = `${timestampName()}${label ? '_' + label : ''}`;
  const targetDir = path.join(BACKUP_DIR, folderName);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const fileName of BACKUP_TARGETS) {
    const src = path.join(DATA_DIR, fileName);
    const dest = path.join(targetDir, fileName);
    if (fs.existsSync(src)) fs.copyFileSync(src, dest);
    else fs.writeFileSync(dest, fileName === 'settings.json' ? '{}' : '[]', 'utf8');
  }
  return folderName;
}

function listBackups() {
  ensureBackupDir();
  return fs
    .readdirSync(BACKUP_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const full = path.join(BACKUP_DIR, e.name);
      const stat = fs.statSync(full);
      return { name: e.name, createdAt: stat.mtime, files: BACKUP_TARGETS.filter((f) => fs.existsSync(path.join(full, f))) };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

function backupExists(name) {
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) return false;
  return fs.existsSync(path.join(BACKUP_DIR, name));
}

function restoreBackup(name) {
  if (!backupExists(name)) throw new Error('Secilen yedek bulunamadi.');
  createBackup('geri-yukleme-oncesi');
  const sourceDir = path.join(BACKUP_DIR, name);
  for (const fileName of BACKUP_TARGETS) {
    const src = path.join(sourceDir, fileName);
    const dest = path.join(DATA_DIR, fileName);
    if (fs.existsSync(src)) {
      const tmp = `${dest}.tmp-restore-${Date.now()}`;
      fs.copyFileSync(src, tmp);
      fs.renameSync(tmp, dest);
    }
  }
  return true;
}

module.exports = { BACKUP_TARGETS, createBackup, listBackups, restoreBackup, backupExists };
