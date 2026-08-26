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

A role-based employee attendance and absence management application built with **Node.js, Express, EJS, and JSON file storage**. The system manages employees, daily attendance, shifts, late arrivals, overtime, holidays, reports, audit logs, and backups without requiring a database server.

## ✨ Key Features

- Role-based authentication for **admin** and **supervisor** users
- Employee creation, editing, status management, and profile pages
- Daily attendance records: present, absent, leave, and medical report states
- Check-in/check-out time tracking
- Working-hour and overtime calculations
- Late-arrival detection and reporting
- Shift management
- Holiday management
- Department and employee-level reporting
- Excel exports with **ExcelJS**
- PDF reports with **PDFKit**
- Audit logging for operational changes
- Manual backup and restore workflow
- JSON-based storage with atomic writes and corrupt-file protection
- Turkish user interface

## 🔐 Security & Portfolio Notes

This public repository is a sanitized portfolio version:

- Real `.env` files are excluded from Git.
- No production credentials are committed.
- `data/users.json` contains no passwords.
- Login credentials are configured through environment variables.
- Backup files are excluded from the repository.
- Bundled font binaries are not included; an optional Unicode font path can be configured for Turkish PDF output.

For a production deployment, password hashing, persistent session storage, CSRF protection, stricter cookie settings, and a database-backed user model would be recommended.

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Server-side runtime |
| Express | Routing and HTTP application layer |
| EJS | Server-rendered user interface |
| express-session | Session-based authentication |
| JSON files | Lightweight persistent storage |
| ExcelJS | Excel report generation |
| PDFKit | PDF report generation |
| Multer | File upload handling |
| Bootstrap / CSS | User interface styling |

## 🏗️ Architecture

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
├── views/
├── public/
└── data/
```

## 🚀 Installation

```bash
git clone https://github.com/safialajati2-creator/employee-attendance-management-system.git
cd employee-attendance-management-system
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set secure local credentials and a strong session secret:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
SUPERVISOR_USERNAME=supervisor
SUPERVISOR_PASSWORD=your_secure_password
SESSION_SECRET=your_long_random_secret
PORT=3000
```

Run the application:

```bash
npm start
```

Open `http://localhost:3000`.

## 👤 Roles

**Admin** can access employee management, reports, backups, late-arrival analysis, settings, shifts, and holidays.

**Supervisor** has restricted operational access and can use attendance-related workflows without receiving full administrative permissions.

## 💾 Storage Model

The project intentionally uses JSON files instead of MySQL, PostgreSQL, MongoDB, or SQLite. The storage layer includes safe reads, atomic writes, ID generation, and protection against silently overwriting malformed JSON files.

## 📊 Reporting

The system supports employee and period-based reports, including attendance states, working hours, overtime, and related operational data. Reports can be exported to Excel and PDF formats.

## 🎯 Project Purpose

This project demonstrates practical skills in **Node.js backend development, Express routing, server-rendered UI development, authentication and authorization, business-rule implementation, file-based persistence, reporting, backup/restore workflows, and operational system design**.
