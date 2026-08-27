'use strict';
const { readData, writeData, generateId } = require('../storage/fileStorage');
function addAuditLog(action, details) {
  const logs = readData('audit_logs');
  const entry = { id: generateId('log'), action: String(action || ''), details: String(details || ''), createdAt: new Date().toISOString() };
  logs.push(entry);
  writeData('audit_logs', logs);
  return entry;
}
module.exports = { addAuditLog };
