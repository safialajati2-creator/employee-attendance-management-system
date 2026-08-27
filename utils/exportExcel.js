'use strict';
const ExcelJS = require('exceljs');
const { dayNameTr, formatDateTr, monthNameTr } = require('./dateUtils');
const { summarize } = require('./calculationUtils');

const STATUS_FILL = { Geldi:'FFC6EFCE', Gelmedi:'FFFFC7CE', İzinli:'FFBDD7EE', Raporlu:'FFFFE699' };
const HEADER_FILL = 'FF1F4E78';
const TITLE_FILL = 'FFDDEBF7';
function thinBorder(){ return {top:{style:'thin',color:{argb:'FFBFBFBF'}},left:{style:'thin',color:{argb:'FFBFBFBF'}},bottom:{style:'thin',color:{argb:'FFBFBFBF'}},right:{style:'thin',color:{argb:'FFBFBFBF'}}}; }
function autoWidth(worksheet,minWidth=10,maxWidth=45){ worksheet.columns.forEach((column)=>{let max=minWidth;column.eachCell({includeEmpty:true},(cell)=>{const len=(cell.value==null?'':String(cell.value)).length+2;if(len>max)max=len;});column.width=Math.min(max,maxWidth);}); }

async function buildEmployeeMonthlyWorkbook(employee,records,year,month){
  const wb=new ExcelJS.Workbook(); wb.creator='Devam Takip Sistemi'; wb.created=new Date();
  const ws=wb.addWorksheet('Aylık Rapor',{views:[{state:'frozen',ySplit:5}]});
  ws.mergeCells('A1:J1'); ws.getCell('A1').value='Aylık Devam Raporu'; ws.getCell('A1').font={bold:true,size:16,color:{argb:'FF1F4E78'}}; ws.getCell('A1').alignment={horizontal:'center'};
  ws.getCell('A2').value='Ad Soyad:'; ws.getCell('B2').value=`${employee.firstName} ${employee.lastName}`;
  ws.getCell('D2').value='Kimlik No:'; ws.getCell('E2').value=employee.kimlikNo;
  ws.getCell('G2').value='Departman:'; ws.getCell('H2').value=employee.department||'';
  ws.getCell('A3').value='Dönem:'; ws.getCell('B3').value=`${monthNameTr(month)} ${year}`;
  ['A2','D2','G2','A3'].forEach((c)=>ws.getCell(c).font={bold:true});
  const headers=['Tarih','Gün','Durum','Giriş Saati','Çıkış Saati','Çalışma Saati','Fazla Mesai Başlangıç','Fazla Mesai Bitiş','Fazla Mesai Saati','Devamsızlık Sebebi','Sağlık Raporu','Açıklama'];
  const headerRow=ws.getRow(5); headers.forEach((h,i)=>{const cell=headerRow.getCell(i+1);cell.value=h;cell.font={bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:HEADER_FILL}};cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};cell.border=thinBorder();});
  let rowIdx=6;
  for(const r of records){
    const values=[formatDateTr(r.date),dayNameTr(r.date),r.status,r.checkIn||'',r.checkOut||'',Number(r.workHours)||0,r.overtimeStart||'',r.overtimeEnd||'',Number(r.overtimeHours)||0,r.absenceReason||'',r.medicalReport||'Hayır',r.note||''];
    const row=ws.getRow(rowIdx); values.forEach((v,i)=>{const cell=row.getCell(i+1);cell.value=v;cell.border=thinBorder();cell.alignment={vertical:'middle',wrapText:true};});
    const fill=STATUS_FILL[r.status]; if(fill){row.getCell(3).fill={type:'pattern',pattern:'solid',fgColor:{argb:fill}};row.getCell(3).font={bold:true};} rowIdx++;
  }
  const s=summarize(records); rowIdx++;
  for(const [label,val] of [['Toplam Geldi Gün',s.geldi],['Toplam Gelmedi Gün',s.gelmedi],['Toplam İzinli Gün',s.izinli],['Toplam Raporlu Gün',s.raporlu],['Toplam Çalışma Saati',s.totalWorkHours],['Toplam Fazla Mesai Saati',s.totalOvertimeHours]]){
    const row=ws.getRow(rowIdx++); const lc=row.getCell(1);lc.value=label;lc.font={bold:true};lc.fill={type:'pattern',pattern:'solid',fgColor:{argb:TITLE_FILL}};lc.border=thinBorder(); const vc=row.getCell(2);vc.value=val;vc.border=thinBorder();
  }
  autoWidth(ws); return wb;
}

async function buildGeneralMonthlyWorkbook(rows,year,month){
  const wb=new ExcelJS.Workbook(); wb.creator='Devam Takip Sistemi'; wb.created=new Date(); const ws=wb.addWorksheet('Aylık Özet');
  ws.mergeCells('A1:I1'); ws.getCell('A1').value=`Tüm Çalışanlar Aylık Özet - ${monthNameTr(month)} ${year}`; ws.getCell('A1').font={bold:true,size:15,color:{argb:'FF1F4E78'}}; ws.getCell('A1').alignment={horizontal:'center'};
  const headers=['Ad Soyad','Kimlik No','Departman','Geldi Gün Sayısı','Gelmedi Gün Sayısı','İzinli Gün Sayısı','Raporlu Gün Sayısı','Toplam Çalışma Saati','Toplam Fazla Mesai Saati'];
  const headerRow=ws.getRow(3); headers.forEach((h,i)=>{const cell=headerRow.getCell(i+1);cell.value=h;cell.font={bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:HEADER_FILL}};cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};cell.border=thinBorder();}); ws.views=[{state:'frozen',ySplit:3}];
  let rowIdx=4; for(const {employee,summary} of rows){const row=ws.getRow(rowIdx++);[`${employee.firstName} ${employee.lastName}`,employee.kimlikNo,employee.department||'',summary.geldi,summary.gelmedi,summary.izinli,summary.raporlu,summary.totalWorkHours,summary.totalOvertimeHours].forEach((v,i)=>{const cell=row.getCell(i+1);cell.value=v;cell.border=thinBorder();cell.alignment={vertical:'middle'};});}
  autoWidth(ws); return wb;
}
module.exports={buildEmployeeMonthlyWorkbook,buildGeneralMonthlyWorkbook};
