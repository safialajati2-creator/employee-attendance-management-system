'use strict';
const express = require('express');
const router = express.Router();
const { createBackup, listBackups, restoreBackup, backupExists } = require('../storage/backup');
const { addAuditLog } = require('../utils/auditLog');
router.get('/', (req, res) => res.render('backups/index', { title: 'Yedekler', backups: listBackups() }));
router.post('/create', (req, res) => {
  const name = createBackup('manuel');
  addAuditLog('BACKUP_CREATED', `Manuel yedek oluşturuldu: ${name}`);
  req.session.flash = { type: 'success', message: `Yedek başarıyla oluşturuldu: ${name}` };
  res.redirect('/backups');
});
router.post('/restore', (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!backupExists(name)) {
    req.session.flash = { type: 'danger', message: 'Seçilen yedek bulunamadı.' };
    return res.redirect('/backups');
  }
  try {
    restoreBackup(name);
    addAuditLog('BACKUP_RESTORED', `Yedekten geri yüklendi: ${name}`);
    req.session.flash = { type: 'success', message: `Yedek geri yüklendi: ${name}` };
  } catch (err) {
    req.session.flash = { type: 'danger', message: `Geri yükleme başarısız: ${err.message}` };
  }
  res.redirect('/backups');
});
module.exports = router;
