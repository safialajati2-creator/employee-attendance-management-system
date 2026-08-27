'use strict';

const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, readHolidays } = require('../storage/fileStorage');
const { createBackup } = require('../storage/backup');
const { addAuditLog } = require('../utils/auditLog');
const { validateAndComputeAttendance, STATUSES } = require('../utils/calculationUtils');
const { isValidDate, todayStr, dayNameTr, formatDateTr } = require('../utils/dateUtils');

function getEmployees() { return readData('employees'); }
function getAttendance() { return readData('attendance'); }
function activeEmployees(req) {
  return getEmployees()
    .filter((e) => e.status === 'Aktif')
    .filter((e) => !req || req.session.role !== 'supervisor' || !e.attendanceSupervisor || e.attendanceSupervisor === req.session.username)
    .sort((a, b) => a.firstName.localeCompare(b.firstName, 'tr'));
}

router.get('/', (req, res) => {
  let date = String(req.query.date || '').trim();
  if (!isValidDate(date)) date = todayStr();
  const employees = activeEmployees(req);
  const holiday = readHolidays().find((h) => h.date === date);
  const all = getAttendance();
  const byEmp = {};
  for (const rec of all) if (rec.date === date) byEmp[rec.employeeId] = rec;
  res.render('attendance/daily', {
    title: 'Günlük Kayıt', holiday, date, dayName: dayNameTr(date), employees, byEmp,
    statuses: STATUSES, errors: [], submitted: null,
  });
});

router.post('/save', (req, res) => {
  const date = String(req.body.date || '').trim();
  if (!isValidDate(date)) {
    req.session.flash = { type: 'danger', message: 'Geçerli bir tarih seçilmelidir.' };
    return res.redirect('/attendance');
  }
  const rows = req.body.rows || {};
  const employees = activeEmployees(req);
  const errors = [];
  const toSave = [];
  for (const emp of employees) {
    const row = rows[emp.id];
    if (!row) continue;
    const status = String(row.status || '').trim();
    if (!status) continue;
    const result = validateAndComputeAttendance({
      status, checkIn: row.checkIn, checkOut: row.checkOut,
      overtimeStart: row.overtimeStart, overtimeEnd: row.overtimeEnd,
      absenceReason: row.absenceReason, medicalReport: row.medicalReport,
      note: row.note, shiftId: emp.shiftId, date,
    });
    if (result.errors) result.errors.forEach((e) => errors.push(`${emp.firstName} ${emp.lastName}: ${e}`));
    else toSave.push({ employeeId: emp.id, value: result.value });
  }
  if (errors.length) {
    const byEmp = {};
    const all = getAttendance();
    for (const rec of all) if (rec.date === date) byEmp[rec.employeeId] = rec;
    return res.status(400).render('attendance/daily', {
      title: 'Günlük Kayıt', date, dayName: dayNameTr(date), employees, byEmp,
      statuses: STATUSES, errors, submitted: rows,
    });
  }
  if (!toSave.length) {
    req.session.flash = { type: 'warning', message: 'Kaydedilecek bir durum seçilmedi.' };
    return res.redirect(`/attendance?date=${date}`);
  }
  createBackup('otomatik-gunluk-kayit');
  const all = getAttendance();
  const now = new Date().toISOString();
  let created = 0, updated = 0;
  for (const item of toSave) {
    const existingIdx = all.findIndex((a) => a.employeeId === item.employeeId && a.date === date);
    if (existingIdx !== -1) {
      all[existingIdx] = Object.assign({}, all[existingIdx], item.value, { date, updatedAt: now });
      updated += 1;
    } else {
      all.push(Object.assign({ id: generateId('att'), employeeId: item.employeeId, date }, item.value, { createdAt: now, updatedAt: now }));
      created += 1;
    }
  }
  writeData('attendance', all);
  addAuditLog('ATTENDANCE_CREATED', `${formatDateTr(date)} tarihi için ${created} yeni, ${updated} güncellenen devam kaydı işlendi.`);
  req.session.flash = { type: 'success', message: `Kayıtlar başarıyla kaydedildi. (${created} yeni, ${updated} güncelleme)` };
  res.redirect(`/attendance?date=${date}`);
});

router.get('/:id/edit', (req, res) => {
  const all = getAttendance();
  const record = all.find((a) => a.id === req.params.id);
  if (!record) {
    req.session.flash = { type: 'danger', message: 'Devam kaydı bulunamadı.' };
    return res.redirect('/attendance');
  }
  const employee = getEmployees().find((e) => e.id === record.employeeId) || null;
  res.render('attendance/edit', { title: 'Devam Kaydı Düzenle', record, employee, statuses: STATUSES, errors: [] });
});

router.post('/:id', (req, res) => {
  const all = getAttendance();
  const idx = all.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    req.session.flash = { type: 'danger', message: 'Devam kaydı bulunamadı.' };
    return res.redirect('/attendance');
  }
  const record = all[idx];
  const employee = getEmployees().find((e) => e.id === record.employeeId) || null;
  const result = validateAndComputeAttendance({
    status: req.body.status, checkIn: req.body.checkIn, checkOut: req.body.checkOut,
    overtimeStart: req.body.overtimeStart, overtimeEnd: req.body.overtimeEnd,
    absenceReason: req.body.absenceReason, medicalReport: req.body.medicalReport,
    note: req.body.note, shiftId: employee ? employee.shiftId : '', date: record.date,
  });
  if (result.errors) {
    const merged = Object.assign({}, record, req.body);
    return res.status(400).render('attendance/edit', { title: 'Devam Kaydı Düzenle', record: merged, employee, statuses: STATUSES, errors: result.errors });
  }
  createBackup('otomatik-kayit-duzenle');
  all[idx] = Object.assign({}, record, result.value, { updatedAt: new Date().toISOString() });
  writeData('attendance', all);
  addAuditLog('ATTENDANCE_UPDATED', `${employee ? employee.firstName + ' ' + employee.lastName : 'Çalışan'} - ${formatDateTr(record.date)} devam kaydı güncellendi.`);
  req.session.flash = { type: 'success', message: 'Devam kaydı güncellendi.' };
  res.redirect(`/employees/${record.employeeId}?year=${record.date.slice(0, 4)}&month=${parseInt(record.date.slice(5, 7), 10)}`);
});

module.exports = router;
