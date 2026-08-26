'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const { ensureStorage, readData, CorruptDataError } = require('./storage/fileStorage');
const { requireAuth, requireRole } = require('./middleware/auth');
const { todayStr, formatDateTr, dayNameTr } = require('./utils/dateUtils');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const reportRoutes = require('./routes/reports');
const backupRoutes = require('./routes/backups');
const importRoutes = require('./routes/import');
const lateRoutes = require('./routes/late');
const settingsRoutes = require('./routes/settings');
const shiftsRoutes = require('./routes/shifts');
const holidayRoutes = require('./routes/holidays');

ensureStorage();

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required. Copy .env.example to .env and configure it.');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 },
}));

app.use((req, res, next) => {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  res.locals.currentUser = req.session.username || null;
  res.locals.userRole = req.session.role || 'admin';
  res.locals.isAuthenticated = !!(req.session && req.session.isAuthenticated);
  res.locals.currentPath = req.path;
  res.locals.title = 'Devam Takip Sistemi';
  next();
});

app.use('/', authRoutes);

app.get('/', requireAuth, (req, res) => {
  const employees = readData('employees');
  const attendance = readData('attendance');
  const activeCount = employees.filter((e) => e.status === 'Aktif').length;
  const passiveCount = employees.filter((e) => e.status === 'Pasif').length;

  const today = todayStr();
  const todays = attendance.filter((a) => a.date === today);
  const todaySummary = {
    geldi: todays.filter((a) => a.status === 'Geldi').length,
    gelmedi: todays.filter((a) => a.status === 'Gelmedi').length,
    izinli: todays.filter((a) => a.status === 'İzinli').length,
    raporlu: todays.filter((a) => a.status === 'Raporlu').length,
    total: todays.length,
  };

  const lateRecords = todays.filter((a) => a.late);
  const lateToday = lateRecords.length;
  const lateMinutesToday = lateRecords.reduce((sum, a) => sum + (Number(a.lateMinutes) || 0), 0);
  const waitingCount = Math.max(activeCount - todaySummary.total, 0);

  const byEmployee = {};
  lateRecords.forEach((a) => {
    byEmployee[a.employeeId] = (byEmployee[a.employeeId] || 0) + (Number(a.lateMinutes) || 0);
  });

  let topLateEmployee = null;
  const topLateEntry = Object.entries(byEmployee).sort((a, b) => b[1] - a[1])[0];
  if (topLateEntry) {
    const emp = employees.find((e) => e.id === topLateEntry[0]);
    if (emp) topLateEmployee = { name: `${emp.firstName} ${emp.lastName}`, minutes: topLateEntry[1] };
  }

  const recentEntries = todays
    .filter((a) => a.status === 'Geldi')
    .sort((a, b) => String(b.checkIn || '').localeCompare(String(a.checkIn || '')))
    .slice(0, 5)
    .map((a) => {
      const emp = employees.find((e) => e.id === a.employeeId) || {};
      return {
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
        department: emp.department || '',
        initials: `${(emp.firstName || '').charAt(0)}${(emp.lastName || '').charAt(0)}`.toUpperCase(),
        checkIn: a.checkIn || '',
        late: !!a.late,
        lateMinutes: a.lateMinutes || 0,
        status: a.status,
      };
    });

  res.render('dashboard', {
    title: 'Panel', activeCount, passiveCount,
    todayStr: formatDateTr(today), todayDayName: dayNameTr(today),
    todaySummary, lateToday, lateMinutesToday, waitingCount, topLateEmployee, recentEntries,
  });
});

app.use('/employees', requireAuth, requireRole('admin'), employeeRoutes);
app.use('/attendance', requireAuth, attendanceRoutes);
app.use('/reports', requireAuth, requireRole('admin'), reportRoutes);
app.use('/backups', requireAuth, requireRole('admin'), backupRoutes);
app.use('/employees/import', requireAuth, requireRole('admin'), importRoutes);
app.use('/late', requireAuth, requireRole('admin'), lateRoutes);
app.use('/settings', requireAuth, requireRole('admin'), settingsRoutes);
app.use('/shifts', requireAuth, requireRole('admin'), shiftsRoutes);
app.use('/holidays', requireAuth, requireRole('admin'), holidayRoutes);

app.use((req, res) => res.status(404).render('error', {
  title: 'Sayfa Bulunamadı', layout: false,
  message: 'Aradığınız sayfa bulunamadı (404).', detail: '',
}));

app.use((err, req, res, next) => {
  console.error(err);
  const isCorrupt = err instanceof CorruptDataError;
  res.status(isCorrupt ? 500 : err.status || 500).render('error', {
    title: 'Hata', layout: false,
    message: isCorrupt ? 'Veri dosyası okunamadı veya bozuk.' : 'Beklenmeyen bir hata oluştu.',
    detail: err.message || '',
  });
});

app.listen(PORT, () => console.log(`Devam Takip Sistemi çalışıyor: http://localhost:${PORT}`));
