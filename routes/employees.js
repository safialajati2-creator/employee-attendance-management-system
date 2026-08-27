'use strict';

const express = require('express');
const router = express.Router();
const { readData, writeData, generateId, readShifts, readUsers } = require('../storage/fileStorage');
const { createBackup } = require('../storage/backup');
const { addAuditLog } = require('../utils/auditLog');
const { summarize } = require('../utils/calculationUtils');
const { isValidDate, dayNameTr, monthNameTr, getYearMonth } = require('../utils/dateUtils');
const { buildEmployeeMonthlyWorkbook } = require('../utils/exportExcel');
const { streamEmployeeMonthlyPdf } = require('../utils/exportPdf');

function getEmployees(){ return readData('employees'); }
function getAttendance(){ return readData('attendance'); }
function findEmployee(id){ return getEmployees().find((e)=>e.id===id)||null; }
function employeeHasAttendance(id){ return getAttendance().some((a)=>a.employeeId===id); }
function trLower(str){ return String(str||'').replace(/İ/g,'i').replace(/I/g,'ı').toLocaleLowerCase('tr-TR'); }
function validateKimlikNo(kimlikNo){ return /^\d{11}$/.test(kimlikNo); }
function slugify(str){
  const map={ç:'c',ğ:'g',ı:'i',ö:'o',ş:'s',ü:'u',İ:'I',Ç:'C',Ğ:'G',Ö:'O',Ş:'S',Ü:'U'};
  return String(str).replace(/[çğıöşüİÇĞÖŞÜ]/g,(c)=>map[c]||c).replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}

router.get('/',(req,res)=>{
  const q=String(req.query.q||'').trim();
  let employees=getEmployees();
  const shifts=readShifts();
  const shiftMap=Object.fromEntries(shifts.map((s)=>[s.id,s]));
  if(q){
    const needle=trLower(q);
    employees=employees.filter((e)=>trLower(e.firstName).includes(needle)||trLower(e.lastName).includes(needle)||trLower(`${e.firstName} ${e.lastName}`).includes(needle)||String(e.kimlikNo).includes(q));
  }
  employees.sort((a,b)=>trLower(a.firstName).localeCompare(trLower(b.firstName),'tr'));
  res.render('employees/index',{title:'Çalışanlar',employees,q,shiftMap});
});

router.get('/new',(req,res)=>res.render('employees/form',{
  title:'Yeni Çalışan Ekle',
  employee:{firstName:'',lastName:'',kimlikNo:'',department:'',startDate:'',status:'Aktif',notes:''},
  formAction:'/employees',isEdit:false,errors:[],shifts:readShifts(),supervisors:readUsers().filter((u)=>u.role==='supervisor'),
}));

router.post('/',(req,res)=>{
  const data=normalizeEmployeeInput(req.body);
  const errors=validateEmployeeInput(data,null);
  if(errors.length) return res.status(400).render('employees/form',{title:'Yeni Çalışan Ekle',employee:data,formAction:'/employees',isEdit:false,errors,shifts:readShifts(),supervisors:readUsers().filter((u)=>u.role==='supervisor')});
  createBackup('otomatik-calisan-ekle');
  const employees=getEmployees();
  const now=new Date().toISOString();
  const employee={id:generateId('emp'),firstName:data.firstName,lastName:data.lastName,kimlikNo:data.kimlikNo,department:data.department,startDate:data.startDate,status:data.status,notes:data.notes,attendanceSupervisor:data.attendanceSupervisor,shiftId:data.shiftId,createdAt:now,updatedAt:now};
  employees.push(employee); writeData('employees',employees);
  addAuditLog('EMPLOYEE_CREATED',`${employee.firstName} ${employee.lastName} adlı çalışan eklendi.`);
  req.session.flash={type:'success',message:'Çalışan başarıyla eklendi.'}; res.redirect('/employees');
});

router.get('/:id/edit',(req,res)=>{
  const employee=findEmployee(req.params.id);
  if(!employee){req.session.flash={type:'danger',message:'Çalışan bulunamadı.'};return res.redirect('/employees');}
  res.render('employees/form',{title:'Çalışan Düzenle',employee,formAction:`/employees/${employee.id}`,isEdit:true,errors:[],shifts:readShifts(),supervisors:readUsers().filter((u)=>u.role==='supervisor')});
});

router.post('/:id',(req,res)=>{
  const employees=getEmployees();
  const idx=employees.findIndex((e)=>e.id===req.params.id);
  if(idx===-1){req.session.flash={type:'danger',message:'Çalışan bulunamadı.'};return res.redirect('/employees');}
  const data=normalizeEmployeeInput(req.body);
  const errors=validateEmployeeInput(data,req.params.id);
  if(errors.length) return res.status(400).render('employees/form',{title:'Çalışan Düzenle',employee:Object.assign({},employees[idx],data),formAction:`/employees/${req.params.id}`,isEdit:true,errors,shifts:readShifts(),supervisors:readUsers().filter((u)=>u.role==='supervisor')});
  createBackup('otomatik-calisan-guncelle');
  employees[idx]=Object.assign({},employees[idx],{...data,updatedAt:new Date().toISOString()});
  writeData('employees',employees);
  addAuditLog('EMPLOYEE_UPDATED',`${employees[idx].firstName} ${employees[idx].lastName} adlı çalışan güncellendi.`);
  req.session.flash={type:'success',message:'Çalışan bilgileri güncellendi.'}; res.redirect(`/employees/${req.params.id}`);
});

router.post('/:id/deactivate',(req,res)=>changeStatus(req,res,'Pasif','otomatik-pasif-yap','Çalışan pasif yapıldı.'));
router.post('/:id/activate',(req,res)=>changeStatus(req,res,'Aktif','otomatik-aktif-yap','Çalışan aktif yapıldı.'));
function changeStatus(req,res,status,backupLabel,message){
  const employees=getEmployees(); const idx=employees.findIndex((e)=>e.id===req.params.id);
  if(idx===-1){req.session.flash={type:'danger',message:'Çalışan bulunamadı.'};return res.redirect('/employees');}
  createBackup(backupLabel); employees[idx].status=status; employees[idx].updatedAt=new Date().toISOString(); writeData('employees',employees);
  addAuditLog('EMPLOYEE_UPDATED',`${employees[idx].firstName} ${employees[idx].lastName} adlı çalışan ${status.toLocaleLowerCase('tr-TR')} yapıldı.`);
  req.session.flash={type:'success',message}; return res.redirect(`/employees/${req.params.id}`);
}

router.post('/:id/delete',(req,res)=>{
  const employees=getEmployees(); const idx=employees.findIndex((e)=>e.id===req.params.id);
  if(idx===-1){req.session.flash={type:'danger',message:'Çalışan bulunamadı.'};return res.redirect('/employees');}
  if(employeeHasAttendance(req.params.id)){req.session.flash={type:'danger',message:'Bu çalışanın devam kayıtları bulunduğu için silinemez. Bunun yerine çalışanı "Pasif" yapabilirsiniz.'};return res.redirect(`/employees/${req.params.id}`);}
  createBackup('otomatik-calisan-sil'); const removed=employees.splice(idx,1)[0]; writeData('employees',employees);
  addAuditLog('EMPLOYEE_DELETED',`${removed.firstName} ${removed.lastName} adlı çalışan silindi.`);
  req.session.flash={type:'success',message:'Çalışan silindi.'}; res.redirect('/employees');
});

router.get('/:id',(req,res)=>{
  const employee=findEmployee(req.params.id);
  if(!employee){req.session.flash={type:'danger',message:'Çalışan bulunamadı.'};return res.redirect('/employees');}
  const now=new Date(); const year=parseInt(req.query.year,10)||now.getFullYear(); const month=parseInt(req.query.month,10)||now.getMonth()+1;
  const records=getFilteredRecords(req.params.id,year,month); const summary=summarize(records);
  res.render('employees/show',{title:`${employee.firstName} ${employee.lastName}`,employee,records,summary,year,month,monthName:monthNameTr(month),dayNameTr,years:buildYearOptions(),shiftMap:Object.fromEntries(readShifts().map((s)=>[s.id,s]))});
});

router.get('/:id/export/excel',async(req,res)=>{
  const employee=findEmployee(req.params.id); if(!employee){req.session.flash={type:'danger',message:'Çalışan bulunamadı.'};return res.redirect('/employees');}
  const now=new Date(); const year=parseInt(req.query.year,10)||now.getFullYear(); const month=parseInt(req.query.month,10)||now.getMonth()+1;
  const records=getFilteredRecords(req.params.id,year,month); const wb=await buildEmployeeMonthlyWorkbook(employee,records,year,month);
  const fileName=`${slugify(employee.firstName+'_'+employee.lastName)}_${year}_${String(month).padStart(2,'0')}.xlsx`;
  addAuditLog('EXCEL_EXPORTED',`${employee.firstName} ${employee.lastName} için ${monthNameTr(month)} ${year} Excel raporu indirildi.`);
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); res.setHeader('Content-Disposition',`attachment; filename="${fileName}"`); await wb.xlsx.write(res); res.end();
});

router.get('/:id/export/pdf',(req,res)=>{
  const employee=findEmployee(req.params.id); if(!employee){req.session.flash={type:'danger',message:'Çalışan bulunamadı.'};return res.redirect('/employees');}
  const now=new Date(); const year=parseInt(req.query.year,10)||now.getFullYear(); const month=parseInt(req.query.month,10)||now.getMonth()+1;
  const records=getFilteredRecords(req.params.id,year,month); const fileName=`${slugify(employee.firstName+'_'+employee.lastName)}_${year}_${String(month).padStart(2,'0')}.pdf`;
  addAuditLog('PDF_EXPORTED',`${employee.firstName} ${employee.lastName} için ${monthNameTr(month)} ${year} PDF raporu indirildi.`);
  res.setHeader('Content-Type','application/pdf'); res.setHeader('Content-Disposition',`attachment; filename="${fileName}"`); streamEmployeeMonthlyPdf(res,employee,records,year,month);
});

function getFilteredRecords(employeeId,year,month){ return getAttendance().filter((a)=>{if(a.employeeId!==employeeId)return false;const ym=getYearMonth(a.date);return ym.year===year&&ym.month===month;}).sort((a,b)=>a.date.localeCompare(b.date)); }
function buildYearOptions(){const current=new Date().getFullYear();const years=[];for(let y=current+1;y>=current-5;y--)years.push(y);return years;}
function normalizeEmployeeInput(body){let status=String(body.status||'Aktif').trim();if(!['Aktif','Pasif'].includes(status))status='Aktif';return{firstName:String(body.firstName||'').trim(),lastName:String(body.lastName||'').trim(),kimlikNo:String(body.kimlikNo||'').trim(),department:String(body.department||'').trim(),startDate:String(body.startDate||'').trim(),status,notes:String(body.notes||'').trim(),attendanceSupervisor:String(body.attendanceSupervisor||'').trim(),shiftId:String(body.shiftId||'').trim()};}
function validateEmployeeInput(data,currentId){const errors=[];if(!data.firstName)errors.push('Ad alanı boş bırakılamaz.');if(!data.lastName)errors.push('Soyad alanı boş bırakılamaz.');if(!data.kimlikNo)errors.push('Kimlik No alanı boş bırakılamaz.');else if(!validateKimlikNo(data.kimlikNo))errors.push('Kimlik No 11 haneli ve yalnızca rakamlardan oluşmalıdır.');else{const dup=getEmployees().find((e)=>e.kimlikNo===data.kimlikNo&&e.id!==currentId);if(dup)errors.push('Bu Kimlik No zaten başka bir çalışana ait. Kimlik No benzersiz olmalıdır.');}if(data.startDate&&!isValidDate(data.startDate))errors.push('İşe Başlama Tarihi geçerli bir tarih olmalıdır.');return errors;}

module.exports=router;
