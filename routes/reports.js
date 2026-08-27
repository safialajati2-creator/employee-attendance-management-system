'use strict';
const express = require('express');
const router = express.Router();
const { readData } = require('../storage/fileStorage');
const { addAuditLog } = require('../utils/auditLog');
const { summarize } = require('../utils/calculationUtils');
const { monthNameTr, getYearMonth } = require('../utils/dateUtils');
const { buildGeneralMonthlyWorkbook } = require('../utils/exportExcel');
function getEmployees(){ return readData('employees'); }
function getAttendance(){ return readData('attendance'); }
function buildRows(year, month, includePassive){
  let employees=getEmployees();
  if(!includePassive) employees=employees.filter(e=>e.status==='Aktif');
  employees.sort((a,b)=>a.firstName.localeCompare(b.firstName,'tr'));
  const attendance=getAttendance();
  return employees.map(employee=>{
    const records=attendance.filter(a=>{ if(a.employeeId!==employee.id)return false; const ym=getYearMonth(a.date); return ym.year===year&&ym.month===month; });
    return { employee, summary:summarize(records) };
  });
}
function buildYearOptions(){ const current=new Date().getFullYear(); const years=[]; for(let y=current+1;y>=current-5;y--)years.push(y); return years; }
router.get('/',(req,res)=>{
  const now=new Date();
  const year=parseInt(req.query.year,10)||now.getFullYear();
  const month=parseInt(req.query.month,10)||now.getMonth()+1;
  const includePassive=req.query.includePassive==='1';
  res.render('reports/index',{ title:'Raporlar', rows:buildRows(year,month,includePassive), year, month, monthName:monthNameTr(month), includePassive, years:buildYearOptions() });
});
router.get('/export/excel',async(req,res)=>{
  const now=new Date();
  const year=parseInt(req.query.year,10)||now.getFullYear();
  const month=parseInt(req.query.month,10)||now.getMonth()+1;
  const includePassive=req.query.includePassive==='1';
  const rows=buildRows(year,month,includePassive);
  const wb=await buildGeneralMonthlyWorkbook(rows,year,month);
  const fileName=`Tum_Calisanlar_${year}_${String(month).padStart(2,'0')}.xlsx`;
  addAuditLog('EXCEL_EXPORTED',`Tüm çalışanlar ${monthNameTr(month)} ${year} genel Excel raporu indirildi.`);
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition',`attachment; filename="${fileName}"`);
  await wb.xlsx.write(res); res.end();
});
module.exports=router;
