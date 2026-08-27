const express = require('express');
const router = express.Router();
const { readData, readShifts, readSettings } = require('../storage/fileStorage');
const { addAuditLog } = require('../utils/auditLog');
const { resolveUnicodeFonts } = require('../utils/fontUtils');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

function trLower(str) {
  return String(str || '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr-TR');
}
function scheduledStart(shiftId, date) {
  const shift = readShifts().find((x) => x.id === shiftId);
  const settings = readSettings();
  let start = shift ? shift.start : settings.workStartTime;
  const d = new Date(date);
  if (shift && d.getDay() === 6) start = shift.saturdayStart || shift.start;
  return start || settings.workStartTime || '09:00';
}
function allRows() {
  const emps = readData('employees');
  return readData('attendance')
    .filter((a) => a.late)
    .map((a) => {
      const e = emps.find((emp) => emp.id === a.employeeId);
      return e ? { a, e, scheduledStart: scheduledStart(e.shiftId, a.date) } : null;
    })
    .filter(Boolean)
    .sort((x, y) => String(y.a.date).localeCompare(String(x.a.date)) || (Number(y.a.lateMinutes) || 0) - (Number(x.a.lateMinutes) || 0));
}
function getYears(rows) {
  const years = [...new Set(rows.map((r) => String(r.a.date).slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const current = String(new Date().getFullYear());
  if (!years.includes(current)) years.unshift(current);
  return years;
}
function buildSummary(rows) {
  const totalMinutes = rows.reduce((sum, r) => sum + (Number(r.a.lateMinutes) || 0), 0);
  const byEmployee = {};
  rows.forEach((r) => {
    if (!byEmployee[r.e.id]) byEmployee[r.e.id] = { name: `${r.e.firstName} ${r.e.lastName}`, minutes: 0 };
    byEmployee[r.e.id].minutes += Number(r.a.lateMinutes) || 0;
  });
  return { totalCount: rows.length, totalMinutes, topEmployee: Object.values(byEmployee).sort((a, b) => b.minutes - a.minutes)[0] || null };
}

router.get('/', (req, res) => {
  const filters = { q: String(req.query.q || '').trim(), month: String(req.query.month || '').trim(), year: String(req.query.year || '').trim() };
  let rows = allRows();
  const years = getYears(rows);
  if (filters.q) {
    const q = trLower(filters.q);
    rows = rows.filter((r) => trLower(`${r.e.firstName} ${r.e.lastName}`).includes(q) || trLower(r.e.department).includes(q) || String(r.e.kimlikNo || '').includes(filters.q));
  }
  if (filters.year) rows = rows.filter((r) => String(r.a.date).slice(0, 4) === filters.year);
  if (filters.month) rows = rows.filter((r) => String(parseInt(String(r.a.date).slice(5, 7), 10)) === String(parseInt(filters.month, 10)));
  res.render('late/index', { title: 'Geç Gelenler', rows, summary: buildSummary(rows), filters, years });
});

router.get('/excel', async (req, res) => {
  const list = allRows();
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Devam Takip Sistemi';
  const ws = wb.addWorksheet('Geç Gelenler');
  ws.mergeCells('A1:G1'); ws.getCell('A1').value = 'GEÇ GELENLER RAPORU'; ws.getCell('A1').font = { bold: true, size: 16 }; ws.getCell('A1').alignment = { horizontal: 'center' };
  ws.getCell('A2').value = `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`;
  ws.getRow(4).values = ['Personel','Departman','Tarih','Giriş Saati','Planlanan Başlangıç','Geç Kalma Dakikası','Durum'];
  ws.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' } }; ws.getRow(4).fill = { type:'pattern', pattern:'solid', fgColor:{argb:'1D4ED8'} };
  list.forEach((x) => ws.addRow([`${x.e.firstName} ${x.e.lastName}`, x.e.department || '', x.a.date, x.a.checkIn, x.scheduledStart, x.a.lateMinutes, 'GEÇ GELDİ']));
  ws.columns = [{width:22},{width:18},{width:14},{width:14},{width:20},{width:18},{width:16}]; ws.autoFilter = 'A4:G4';
  addAuditLog('EXPORT_EXCEL', 'Geç gelenler Excel raporu');
  res.setHeader('Content-Disposition', 'attachment; filename=Gec_Gelenler_Raporu.xlsx'); await wb.xlsx.write(res); res.end();
});

router.get('/pdf', (req, res) => {
  const list = allRows();
  const fonts = resolveUnicodeFonts();
  if (!fonts.regular) return res.status(500).send('Türkçe PDF için Unicode font bulunamadı. PDF_FONT_PATH ayarlayın.');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=Gec_Gelenler_Raporu.pdf');
  const doc = new PDFDocument({ size:'A4', margin:40 });
  doc.registerFont('TR', fonts.regular);
  doc.registerFont('TR-Bold', fonts.bold || fonts.regular);
  doc.pipe(res);
  doc.font('TR');
  doc.fontSize(18).text('GEÇ GELENLER RAPORU', { align:'center' }); doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#475569').text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, { align:'right' }); doc.moveDown(1);
  list.forEach((x, index) => {
    const top = doc.y;
    doc.roundedRect(40, top, 515, 58).strokeColor('#E2E8F0').lineWidth(1).stroke();
    doc.fillColor('#0F172A').fontSize(11).text(`${x.e.firstName} ${x.e.lastName}`, 52, top + 10);
    doc.fillColor('#475569').fontSize(9).text(`${x.e.department || '-'} • ${x.a.date}`, 52, top + 28);
    doc.fillColor('#0F172A').fontSize(10).text(`Giriş: ${x.a.checkIn || '-'}   |   Planlanan: ${x.scheduledStart}   |   Gecikme: ${x.a.lateMinutes} dk`, 260, top + 20, { width:280, align:'right' });
    doc.y = top + 70; if (index !== list.length - 1) doc.moveDown(0.2); if (doc.y > 740) doc.addPage();
  });
  addAuditLog('EXPORT_PDF', 'Geç gelenler PDF raporu'); doc.end();
});
module.exports = router;
