'use strict';
const PDFDocument = require('pdfkit');
const { dayNameTr, formatDateTr, monthNameTr } = require('./dateUtils');
const { summarize } = require('./calculationUtils');
const { resolveUnicodeFonts } = require('./fontUtils');

const STATUS_COLOR = { Geldi:'#1e7e34', Gelmedi:'#c82333', İzinli:'#0d6efd', Raporlu:'#e0820c' };

function setupFonts(doc){
  const resolved = resolveUnicodeFonts();
  if (!resolved.regular) throw new Error('Türkçe PDF için Unicode font bulunamadı. PDF_FONT_PATH ayarlayın.');
  doc.registerFont('Main', resolved.regular);
  doc.registerFont('Main-Bold', resolved.bold || resolved.regular);
  return { regular:'Main', bold:'Main-Bold' };
}

function streamEmployeeMonthlyPdf(res,employee,records,year,month){
  const doc=new PDFDocument({size:'A4',layout:'landscape',margin:30});
  const fonts=setupFonts(doc);
  doc.pipe(res);
  const fullName=`${employee.firstName} ${employee.lastName}`;
  const pageLeft=doc.page.margins.left, pageRight=doc.page.width-doc.page.margins.right, usableWidth=pageRight-pageLeft;
  doc.font(fonts.bold).fontSize(16).fillColor('#1F4E78').text('Aylık Devam Raporu',{align:'center'}); doc.moveDown(0.3);
  doc.font(fonts.regular).fontSize(10).fillColor('#000000').text(`Ad Soyad: ${fullName}    |    Kimlik No: ${employee.kimlikNo}    |    Departman: ${employee.department||'-'}    |    Dönem: ${monthNameTr(month)} ${year}`,{align:'center'}); doc.moveDown(0.6);
  const columns=[{key:'date',label:'Tarih',w:.09},{key:'day',label:'Gün',w:.08},{key:'status',label:'Durum',w:.07},{key:'in',label:'Giriş',w:.06},{key:'out',label:'Çıkış',w:.06},{key:'work',label:'Çalışma',w:.07},{key:'ot',label:'F. Mesai',w:.07},{key:'reason',label:'Devamsızlık Sebebi',w:.16},{key:'report',label:'Rapor',w:.07},{key:'note',label:'Açıklama',w:.20}];
  columns.forEach((c)=>c.width=c.w*usableWidth); const rowHeight=20; let y=doc.y;
  function drawHeader(){let x=pageLeft;doc.rect(pageLeft,y,usableWidth,rowHeight).fill('#1F4E78');doc.font(fonts.bold).fontSize(8).fillColor('#FFFFFF');columns.forEach((c)=>{doc.text(c.label,x+2,y+6,{width:c.width-4,align:'left'});x+=c.width;});y+=rowHeight;}
  function ensureSpace(needed){if(y+needed>doc.page.height-doc.page.margins.bottom){doc.addPage();y=doc.page.margins.top;drawHeader();}}
  drawHeader(); doc.font(fonts.regular).fontSize(8); let zebra=false;
  for(const r of records){
    ensureSpace(rowHeight);let x=pageLeft;if(zebra)doc.rect(pageLeft,y,usableWidth,rowHeight).fill('#F2F6FC');zebra=!zebra;
    const cells={date:formatDateTr(r.date),day:dayNameTr(r.date),status:r.status,in:r.checkIn||'-',out:r.checkOut||'-',work:String(Number(r.workHours)||0),ot:String(Number(r.overtimeHours)||0),reason:r.absenceReason||'-',report:r.medicalReport||'Hayır',note:r.note||'-'};
    columns.forEach((c)=>{const color=c.key==='status'?(STATUS_COLOR[r.status]||'#000000'):'#000000';doc.fillColor(color).font(c.key==='status'?fonts.bold:fonts.regular).text(cells[c.key],x+2,y+6,{width:c.width-4,height:rowHeight,align:'left',ellipsis:true,lineBreak:false});x+=c.width;});
    doc.strokeColor('#DDDDDD').lineWidth(.5).moveTo(pageLeft,y+rowHeight).lineTo(pageRight,y+rowHeight).stroke();y+=rowHeight;
  }
  const s=summarize(records);ensureSpace(rowHeight*4);y+=10;doc.font(fonts.bold).fontSize(11).fillColor('#1F4E78').text('Aylık Toplamlar',pageLeft,y);y+=18;doc.font(fonts.regular).fontSize(9).fillColor('#000000');
  doc.text(`Toplam Geldi Gün: ${s.geldi}     Toplam Gelmedi Gün: ${s.gelmedi}     Toplam İzinli Gün: ${s.izinli}     Toplam Raporlu Gün: ${s.raporlu}`,pageLeft,y,{width:usableWidth});y+=16;
  doc.text(`Toplam Çalışma Saati: ${s.totalWorkHours}     Toplam Fazla Mesai Saati: ${s.totalOvertimeHours}`,pageLeft,y,{width:usableWidth});doc.end();
}
module.exports={streamEmployeeMonthlyPdf};
