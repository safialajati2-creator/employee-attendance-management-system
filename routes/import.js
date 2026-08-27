const express=require('express'); const router=express.Router();
const multer=require('multer'); const ExcelJS=require('exceljs');
const {readData,writeData,generateId}=require('../storage/fileStorage');
const {addAuditLog}=require('../utils/auditLog');
const upload=multer({dest:'tmp/'});
router.get('/',(req,res)=>res.render('employees/import',{title:'Excelden Personel İçe Aktar',result:null}));
router.post('/',upload.single('file'),async(req,res)=>{
 let imported=0,skipped=0,errors=[]; const emps=readData('employees'); const ids=new Set(emps.map(e=>e.kimlikNo));
 try{
 const wb=new ExcelJS.Workbook(); await wb.xlsx.readFile(req.file.path); const ws=wb.worksheets[0];
 ws.eachRow((row,n)=>{
  if(n===1)return; const v=row.values;
  if(!v[2]&&!v[3])return;
  const kimlik=String(v[1]||'').trim(), ad=String(v[2]||'').trim(), soyad=String(v[3]||'').trim();
  if(!/^\d{11}$/.test(kimlik)||ids.has(kimlik)||!ad||!soyad){skipped++;errors.push(`Satır ${n}: geçersiz veya tekrar eden kayıt`);return;}
  emps.push({id:generateId('emp'),firstName:ad,lastName:soyad,kimlikNo:kimlik,department:String(v[4]||''),startDate:String(v[5]||''),status:'Aktif',notes:String(v[6]||''),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}); ids.add(kimlik); imported++;
 });
 writeData('employees',emps); addAuditLog('EMPLOYEE_IMPORT',`${imported} personel aktarıldı, ${skipped} atlandı`);
 }catch(e){errors.push(e.message)}
 res.render('employees/import',{title:'Excelden Personel İçe Aktar',result:{imported,skipped,errors}});
});
module.exports=router;
