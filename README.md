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

A role-based **employee attendance, absence, working-hours, overtime and operational reporting system** built with **Node.js, Express and EJS**. The project is designed as a lightweight business application that does not require a database server; operational data is stored in structured JSON files.

The application covers the complete attendance workflow: employee management, daily attendance entry, check-in/check-out tracking, late-arrival detection, overtime calculations, shifts, reports, Excel/PDF exports, audit logging, settings and backup/restore operations.

## 🖥️ Application Preview

### Dashboard
A central management dashboard summarizes active employees, today's attendance records, late arrivals, pending entries and recent check-ins.

<p align="center">
  <img src="docs/1213.png" alt="Employee Attendance Management System dashboard" width="100%" />
</p>

### Employee Management & Daily Attendance
The employee list provides search, profile access, status information and edit actions. The daily attendance screen allows attendance status, check-in/out, overtime, absence reasons, medical reports and notes to be entered from one table.

<p align="center">
  <img src="docs/132.png" alt="Employee management" width="49%" />
  <img src="docs/1231.png" alt="Daily attendance entry" width="49%" />
</p>

### Late Arrival Analytics & Monthly Reports
Late arrivals can be filtered by employee, month and year and exported to Excel/PDF. Monthly reports summarize attendance states, working hours and overtime for all employees.

<p align="center">
  <img src="docs/12311.png" alt="Late arrival analytics" width="49%" />
  <img src="docs/123123.png" alt="Monthly attendance reports" width="49%" />
</p>

### Work Schedules & System Settings
Administrators can define weekday/Saturday work schedules and late-arrival tolerance, while global settings control default working and overtime hours.

<p align="center">
  <img src="docs/1231231.png" alt="Work schedule management" width="49%" />
  <img src="docs/123123131.png" alt="System settings" width="49%" />
</p>

### Employee Profile
Each employee has a detailed profile with attendance history, late-arrival statistics, working-hour summaries and employee-specific Excel/PDF exports.

<p align="center">
  <img src="docs/123131231.png" alt="Employee profile and attendance history" width="100%" />
</p>

<details>
<summary><b>Employee edit screen</b></summary>
<br>
<p align="center">
  <img src="docs/123131312.png" alt="Employee edit form" width="100%" />
</p>
</details>

## ✨ Main Features

### Employee Management
- Create and edit employee records
- Search by name or identity number
- Activate / deactivate employees
- Delete an employee only when no attendance history exists
- Employee profile pages with monthly attendance and late-arrival summaries
- Assign work schedules and supervisors
- Import employees from `.xlsx`

### Attendance & Absence
- Daily attendance entry screen
- States: **Present (`Geldi`)**, **Absent (`Gelmedi`)**, **Leave (`İzinli`)**, **Medical Report (`Raporlu`)**
- Check-in and check-out tracking
- Duplicate prevention for the same employee and date
- Edit previously saved attendance records
- Notes, absence reasons and medical-report information
- Supervisor-limited operational attendance workflow

### Working Hours, Overtime & Late Arrivals
- Automatic working-hour calculations
- Overtime start/end and total overtime calculations
- Late-arrival detection based on the default schedule or assigned shift
- Configurable late-arrival tolerance
- Separate Saturday shift hours
- Late-arrival summaries and total delay minutes

### Shifts, Holidays & Settings
- Work-schedule / shift definitions
- Weekday and Saturday working hours
- Shift-specific late tolerance
- Holiday-date management
- Global work start/end configuration
- Global overtime start-time configuration

### Reporting & Export
- Employee monthly attendance report
- General monthly employee summary
- Present / absent / leave / medical-report totals
- Total working and overtime hours
- Late-arrival reports
- Excel exports using **ExcelJS**
- PDF exports using **PDFKit**
- Cross-platform Unicode font discovery for Turkish PDF text

### Backup & Audit
- Automatic backups before important changes
- Manual backup creation
- Restore from an existing backup
- Safety backup before restore
- Backup coverage for employees, attendance, audit logs, shifts, settings and holidays
- Audit logging for important system operations

## 👤 Roles & Permissions

### Admin
The administrator has access to the complete application: dashboard, employee management, Excel import, attendance, reports, late-arrival analytics, backups, settings, shifts and holidays.

### Supervisor
The supervisor role is intentionally restricted to operational attendance workflows. Supervisors can access the dashboard and attendance screen for employees visible to them, while administrator-only sections return **403 Forbidden**.

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
| Multer | Temporary Excel upload handling |
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
├── public/
├── docs/
└── data/
```

## 💾 Storage Model

The project intentionally does **not** require MySQL, PostgreSQL, MongoDB or SQLite. It uses local JSON files to demonstrate a lightweight business-system architecture.

The storage layer provides automatic file creation, safe JSON reads, atomic writes through temporary files and rename operations, unique ID generation, corrupt-file detection and timestamped backups. For a large multi-user production deployment, a transactional database would be the recommended next step.

## 🔐 Authentication & Security

This public repository is a sanitized portfolio version:

- Real `.env` files are excluded from Git
- No production passwords or credentials are committed
- Login credentials are loaded from environment variables
- `SESSION_SECRET` is required
- `data/users.json` contains no passwords
- Backup files are excluded from Git
- Excel uploads are temporary, restricted to `.xlsx`, limited in size and removed after processing
- Role-based authorization protects administrative routes

For production use, recommended improvements include password hashing, a persistent session store, CSRF protection, rate limiting, HTTPS secure cookies and a database-backed user model.

## 🌐 Environment Variables

Copy `.env.example` to `.env` and configure local values:

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

The system also searches common Windows, Linux and macOS Unicode font locations automatically so Turkish PDF characters render correctly in typical environments.

## 🚀 Installation & Run

```bash
git clone https://github.com/safialajati2-creator/employee-attendance-management-system.git
cd employee-attendance-management-system
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env`, then run:

```bash
npm start
```

Open `http://localhost:3000`.

## 📥 Excel Employee Import Format

The first worksheet is read and the first row is treated as the header.

| Column | Value |
|---|---|
| A | 11-digit identity number |
| B | First name |
| C | Last name |
| D | Department |
| E | Start date |
| F | Notes |

Invalid, duplicate or incomplete rows are skipped and reported on the result page.

## 📊 Reporting Details

**Employee Monthly Excel / PDF** includes date/day, attendance status, check-in/out, working hours, overtime, absence reason, medical-report state and notes.

**General Monthly Excel** provides employee-level totals for a selected month/year.

**Late Arrival Excel / PDF** contains employee, department, date, actual check-in, scheduled start and late minutes.

## ✅ Verification Performed

The portfolio version was smoke-tested across the main workflows:

- Valid and invalid login
- Unauthenticated redirect to login
- Admin dashboard and admin pages
- Supervisor dashboard and attendance access
- Supervisor denial (`403`) for admin-only sections
- Employee create / read / update / activate / deactivate
- Daily attendance creation and editing
- Employee monthly Excel and PDF exports
- General monthly Excel export
- Late-arrival Excel and PDF exports
- Turkish-character PDF output
- Settings update
- Shift creation
- Holiday creation
- Manual backup creation and restore verification
- Excel employee import
- 404 handling
- JavaScript syntax validation
- EJS template compilation validation

## ⚠️ Portfolio / Production Scope

This repository demonstrates application architecture and real business-process implementation. It is suitable as a portfolio and local/internal demonstration project, but it should not be treated as a finished enterprise HR platform without additional production hardening.

## 🎯 Project Purpose

This project demonstrates practical skills in **Node.js backend development, Express routing, EJS UI development, authentication and authorization, business-rule implementation, file-based persistence, attendance calculations, Excel/PDF reporting, import workflows, audit logging, backup/restore design and operational business-system development**.
