const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const ExcelJS = require('exceljs');
const { readData, writeData, generateId } = require('../storage/fileStorage');
const { addAuditLog } = require('../utils/auditLog');

const upload = multer({
  dest: 'tmp/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.xlsx$/i.test(file.originalname || '');
    cb(ok ? null : new Error('Sadece .xlsx dosyaları desteklenir.'), ok);
  },
});

router.get('/', (req, res) => res.render('employees/import', { title: 'Excelden Personel İçe Aktar', result: null }));

router.post('/', upload.single('file'), async (req, res) => {
  let imported = 0;
  let skipped = 0;
  const errors = [];
  const emps = readData('employees');
  const ids = new Set(emps.map((e) => e.kimlikNo));
  const tempPath = req.file && req.file.path;

  try {
    if (!req.file) throw new Error('Lütfen bir .xlsx dosyası seçin.');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(req.file.path);
    const ws = wb.worksheets[0];
    if (!ws) throw new Error('Excel dosyasında çalışma sayfası bulunamadı.');

    ws.eachRow((row, n) => {
      if (n === 1) return;
      const v = row.values;
      if (!v[2] && !v[3]) return;
      const kimlik = String(v[1] || '').trim();
      const ad = String(v[2] || '').trim();
      const soyad = String(v[3] || '').trim();
      if (!/^\d{11}$/.test(kimlik) || ids.has(kimlik) || !ad || !soyad) {
        skipped += 1;
        errors.push(`Satır ${n}: geçersiz veya tekrar eden kayıt`);
        return;
      }
      emps.push({
        id: generateId('emp'), firstName: ad, lastName: soyad, kimlikNo: kimlik,
        department: String(v[4] || ''), startDate: String(v[5] || ''), status: 'Aktif',
        notes: String(v[6] || ''), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
      ids.add(kimlik);
      imported += 1;
    });

    writeData('employees', emps);
    addAuditLog('EMPLOYEE_IMPORT', `${imported} personel aktarıldı, ${skipped} atlandı`);
  } catch (e) {
    errors.push(e.message);
  } finally {
    if (tempPath) fs.unlink(tempPath, () => {});
  }

  res.render('employees/import', { title: 'Excelden Personel İçe Aktar', result: { imported, skipped, errors } });
});

module.exports = router;
