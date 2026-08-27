'use strict';
const { isValidTime } = require('./dateUtils');
const { calcLate } = require('./lateUtils');

const STATUSES = ['Geldi', 'Gelmedi', 'İzinli', 'Raporlu'];
const PRESENT_STATUS = 'Geldi';

function timeToMinutes(str) {
  if (!isValidTime(str)) return null;
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}
function minutesToHours(minutes) { return Math.round((minutes / 60) * 100) / 100; }
function hoursBetween(startStr, endStr) {
  const start = timeToMinutes(startStr), end = timeToMinutes(endStr);
  if (start === null || end === null || end < start) return null;
  return minutesToHours(end - start);
}

function validateAndComputeAttendance(input) {
  const errors = [];
  const status = String(input.status || '').trim();
  if (!STATUSES.includes(status)) errors.push('Geçerli bir durum seçilmelidir (Geldi, Gelmedi, İzinli, Raporlu).');

  let checkIn = String(input.checkIn || '').trim();
  let checkOut = String(input.checkOut || '').trim();
  let overtimeStart = String(input.overtimeStart || '').trim();
  let overtimeEnd = String(input.overtimeEnd || '').trim();
  const absenceReason = String(input.absenceReason || '').trim();
  let medicalReport = String(input.medicalReport || 'Hayır').trim();
  const note = String(input.note || '').trim();
  if (!['Evet','Hayır'].includes(medicalReport)) medicalReport = 'Hayır';

  let workHours = 0, overtimeHours = 0;
  if (status === PRESENT_STATUS) {
    if (!checkIn || !checkOut) errors.push('Durum "Geldi" ise Giriş Saati ve Çıkış Saati zorunludur.');
    else {
      if (!isValidTime(checkIn)) errors.push('Giriş Saati geçerli bir saat (SS:DD) olmalıdır.');
      if (!isValidTime(checkOut)) errors.push('Çıkış Saati geçerli bir saat (SS:DD) olmalıdır.');
      if (isValidTime(checkIn) && isValidTime(checkOut)) {
        const wh = hoursBetween(checkIn, checkOut);
        if (wh === null) errors.push('Çıkış Saati, Giriş Saatinden önce olamaz.');
        else workHours = wh;
      }
    }
  } else {
    checkIn = ''; checkOut = ''; workHours = 0;
  }

  if (overtimeStart || overtimeEnd) {
    if (!overtimeStart || !overtimeEnd) errors.push('Fazla mesai için hem Başlangıç hem Bitiş saati girilmelidir.');
    else if (!isValidTime(overtimeStart) || !isValidTime(overtimeEnd)) errors.push('Fazla Mesai saatleri geçerli bir saat (SS:DD) olmalıdır.');
    else {
      const oh = hoursBetween(overtimeStart, overtimeEnd);
      if (oh === null) errors.push('Fazla Mesai Bitiş, Fazla Mesai Başlangıçtan önce olamaz.');
      else overtimeHours = oh;
    }
  } else {
    overtimeStart = ''; overtimeEnd = ''; overtimeHours = 0;
  }

  if (errors.length) return { errors };
  return { value: { status, checkIn, checkOut, workHours, overtimeStart, overtimeEnd, overtimeHours, absenceReason, medicalReport, note, ...calcLate(checkIn, input.shiftId, input.date) } };
}

function summarize(records) {
  const summary = { geldi:0, gelmedi:0, izinli:0, raporlu:0, totalWorkHours:0, totalOvertimeHours:0 };
  for (const r of records) {
    if (r.status === 'Geldi') summary.geldi += 1;
    else if (r.status === 'Gelmedi') summary.gelmedi += 1;
    else if (r.status === 'İzinli') summary.izinli += 1;
    else if (r.status === 'Raporlu') summary.raporlu += 1;
    summary.totalWorkHours += Number(r.workHours) || 0;
    summary.totalOvertimeHours += Number(r.overtimeHours) || 0;
  }
  summary.totalWorkHours = Math.round(summary.totalWorkHours * 100) / 100;
  summary.totalOvertimeHours = Math.round(summary.totalOvertimeHours * 100) / 100;
  return summary;
}
module.exports = { STATUSES, PRESENT_STATUS, timeToMinutes, minutesToHours, hoursBetween, validateAndComputeAttendance, summarize };
