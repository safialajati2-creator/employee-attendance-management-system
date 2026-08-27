# 👥 Employee Attendance Management System

<p align="center">
  <b>English</b> | <a href="README_TR.md">Türkçe</a>
</p>

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Templates-B4CA65)
![ExcelJS](https://img.shields.io/badge/ExcelJS-Reports-217346)
![PDFKit](https://img.shields.io/badge/PDFKit-PDF%20Reports-red)
![Status](https://img.shields.io/badge/Status-Portfolio%20Project-success)

A role-based **employee attendance, absence, working-hours, overtime and operational reporting system** built with **Node.js, Express and EJS**. The project was designed as a lightweight business application that works without a database server by storing operational data in structured JSON files.

The application covers the complete daily attendance workflow: employee management, attendance entry, check-in/check-out tracking, late-arrival detection, overtime calculations, shifts, holidays, reports, Excel/PDF exports, audit logs and backup/restore operations.

## 🖥️ Screenshots

Project screenshots will be added here as part of the portfolio presentation.

## ✨ Main Features

### Employee Management
- Create new employee records
- Edit employee information
- Search employees by name or identity number
- Activate / deactivate employees
- Delete an employee only when no attendance history exists
- Employee profile pages with monthly attendance summaries
- Assign a work shift to an employee
- Assign an attendance supervisor
- Import employees from `.xlsx`

### Attendance & Absence
- Daily attendance entry screen
- Supported states: **Present (`Geldi`)**, **Absent (`Gelmedi`)**, **Leave (`İzinli`)**, **Medical Report (`Raporlu`)**
- Check-in and check-out time tracking
- Duplicate prevention for the same employee and date
- Edit previously saved attendance records
- Notes, absence reasons and medical-report information
- Supervisor-limited attendance workflow

### Working Hours, Overtime & Late Arrivals
- Automatic working-hour calculations
- Overtime start/end and total overtime calculations
- Late-arrival detection based on work start time or assigned shift
- Configurable late-arrival tolerance
- Separate Saturday shift hours
- Late-arrival reporting with total delay minutes and employee summaries

### Shifts, Holidays & Settings
- Create work-shift definitions
- Weekday and Saturday working hours
- Shift-specific late tolerance
- Holiday date management
- Global work start/end configuration
- Global overtime start-time configuration

### Reporting
- Monthly employee attendance report
- General monthly employee summary
- Present / absent / leave / medical-report totals
- Total working hours
- Total overtime hours
- Late-arrival report
- Excel export using **ExcelJS**
- PDF export using **PDFKit**
- Cross-platform Unicode-font discovery for Turkish PDF text

### Backup & Audit
- Automatic backups before important employee and attendance changes
- Manual backup creation
- Restore from an existing backup
- Safety backup before restore
- Backup coverage for employees, attendance, audit logs, shifts, settings and holidays
- Audit log records for important system operations

## 👤 Roles & Permissions

### Admin
The administrator has access to the complete application, including:

- Dashboard
- Employee management
- Employee Excel import
- Attendance management
- Reports and exports
- Late-arrival analytics
- Backup / restore
- Settings
- Shifts
- Holidays

### Supervisor
A supervisor is intentionally restricted to operational attendance workflows:

- Dashboard access
- Attendance screen access
- Attendance entry for employees visible to that supervisor

Administrative sections such as employee management, reports, backups, settings, shifts and holidays return **403 Forbidden** for supervisor users.

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Server-side runtime |
| Express | Routing and HTTP application layer |
| EJS | Server-rendered user interface |
| express-ejs-layouts | Shared application layout |
| express-session | Session-based authentication |
| JSON files | Lightweight persistent storage |
| ExcelJS | Excel import and report generation |
| PDFKit | PDF report generation |
| Multer | Secure temporary Excel upload handling |
| Bootstrap / custom CSS | Responsive UI styling |
| Vanilla JavaScript | Front-end interactions |

## 🏗️ Application Architecture

```text
├── server.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── employees.js
│   ├── attendance.js
│   ├── reports.js
│   ├── backups.js
│   ├── import.js
│   ├── late.js
│   ├── settings.js
│   ├── shifts.js
│   └── holidays.js
├── storage/
│   ├── fileStorage.js
│   └── backup.js
├── utils/
│   ├── auditLog.js
│   ├── calculationUtils.js
│   ├── dateUtils.js
│   ├── exportExcel.js
│   ├── exportPdf.js
│   ├── fontUtils.js
│   └── lateUtils.js
├── views/
│   ├── attendance/
│   ├── backups/
│   ├── employees/
│   ├── holidays/
│   ├── late/
│   ├── reports/
│   ├── settings/
│   └── shifts/
├── public/
│   ├── css/
│   └── js/
└── data/
    ├── employees.json
    ├── attendance.json
    ├── audit_logs.json
    ├── shifts.json
    ├── settings.json
    ├── holidays.json
    ├── users.json
    └── backups/
```

## 💾 Storage Model

The project intentionally does **not** require MySQL, PostgreSQL, MongoDB or SQLite. It uses local JSON files to demonstrate a lightweight business system architecture.

The storage layer includes:

- Automatic creation of missing data files
- Safe JSON reads
- Atomic writes through temporary files + rename
- Unique ID generation
- Corrupt-file detection without silently overwriting damaged data
- Timestamped backup folders

This approach is practical for a local/internal demonstration system. For a large multi-user production deployment, a transactional database would be the recommended next step.

## 🔐 Authentication & Security

The public repository is a sanitized portfolio version.

- Real `.env` files are excluded from Git
- No real passwords or production credentials are committed
- Login credentials are loaded from environment variables
- `SESSION_SECRET` is required
- `data/users.json` contains no passwords
- Backups are excluded from Git
- Uploaded Excel files are temporary and limited to `.xlsx`
- Temporary upload files are removed after processing
- Role-based authorization protects administrator routes

For production use, recommended next improvements include password hashing, a persistent session store, CSRF protection, rate limiting, secure-cookie deployment behind HTTPS and a database-backed user model.

## 🌐 Environment Variables

Copy `.env.example` to `.env` and configure your local values:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password

SUPERVISOR_USERNAME=supervisor
SUPERVISOR_PASSWORD=your_secure_supervisor_password

SESSION_SECRET=your_long_random_session_secret
PORT=3000
```

Optional PDF font overrides:

```env
PDF_FONT_PATH=/absolute/path/to/unicode-font.ttf
PDF_FONT_BOLD_PATH=/absolute/path/to/unicode-bold-font.ttf
```

The system also searches common Windows, Linux and macOS Unicode font locations automatically so Turkish PDF characters render correctly on typical environments.

## 🚀 Installation & Run

```bash
git clone https://github.com/safialajati2-creator/employee-attendance-management-system.git
cd employee-attendance-management-system
npm install
```

Create the environment file.

macOS / Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env`, then start the application:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## 📥 Excel Employee Import Format

The first worksheet is read and the first row is treated as a header. Expected columns are:

| Column | Value |
|---|---|
| A | 11-digit identity number |
| B | First name |
| C | Last name |
| D | Department |
| E | Start date |
| F | Notes |

Invalid, duplicate or incomplete rows are skipped and reported on the import result page.

## 📊 Reporting Details

### Employee Monthly Excel / PDF
Contains daily records and monthly totals including:

- Date and day
- Attendance status
- Check-in / check-out
- Working hours
- Overtime
- Absence reason
- Medical report state
- Notes

### General Monthly Excel
Provides employee-level totals for a selected month and year.

### Late Arrival Excel / PDF
Shows employee, department, date, actual check-in, scheduled start and late minutes.

## ✅ Verification Performed

The portfolio version was smoke-tested across the main workflows, including:

- Valid and invalid login
- Unauthenticated redirect to login
- Admin dashboard and all admin pages
- Supervisor dashboard and attendance access
- Supervisor denial (`403`) for admin-only sections
- Employee create / read / update / activate / deactivate
- Daily attendance creation and editing
- Monthly employee Excel export
- Monthly employee PDF export with Turkish characters
- General Excel report export
- Late-arrival Excel export
- Late-arrival PDF export with Turkish characters
- Settings update
- Shift creation
- Holiday creation
- Manual backup creation
- Excel employee import
- 404 page handling
- JavaScript syntax validation
- EJS template compilation validation

## ⚠️ Portfolio / Production Scope

This repository is intended to demonstrate application architecture and real business-process implementation. It is suitable as a portfolio and internal/local demonstration project, but it should not be treated as a finished enterprise HR platform without the production hardening described above.

## 🎯 Project Purpose

This project demonstrates practical skills in **Node.js backend development, Express routing, EJS UI development, authentication and authorization, business-rule implementation, file-based persistence, attendance calculations, Excel/PDF reporting, import workflows, audit logging, backup/restore design and operational business-system development**.
