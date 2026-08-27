const { readSettings, readShifts } = require('../storage/fileStorage');
function calcLate(checkIn, shiftId, date) {
  const shift = readShifts().find((x) => x.id === shiftId);
  const settings = readSettings();
  let start = shift ? shift.start : settings.workStartTime;
  const tolerance = shift ? shift.tolerance : settings.lateTolerance;
  if (shift && new Date(date).getDay() === 6) start = shift.saturdayStart;
  const [h, m] = String(start || '09:00').split(':').map(Number);
  const [ih, im] = String(checkIn || '').split(':').map(Number);
  if (Number.isNaN(ih)) return { late: false, lateMinutes: 0, lateStatus: '' };
  const diff = ih * 60 + im - (h * 60 + m);
  return diff > tolerance ? { late: true, lateMinutes: diff, lateStatus: 'GEÇ GELDİ' } : { late: false, lateMinutes: 0, lateStatus: '' };
}
module.exports = { calcLate };
