'use strict';
const TURKISH_DAYS = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
const TURKISH_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
function isValidDate(str){
  if(typeof str!=='string')return false;
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(str); if(!m)return false;
  const year=Number(m[1]),month=Number(m[2]),day=Number(m[3]); if(month<1||month>12)return false;
  const d=new Date(Date.UTC(year,month-1,day));
  return d.getUTCFullYear()===year&&d.getUTCMonth()===month-1&&d.getUTCDate()===day;
}
function isValidTime(str){
  if(typeof str!=='string')return false;
  const m=/^(\d{2}):(\d{2})$/.exec(str); if(!m)return false;
  const h=Number(m[1]),min=Number(m[2]); return h>=0&&h<=23&&min>=0&&min<=59;
}
function todayStr(){ const d=new Date(); const pad=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function dayNameTr(dateStr){ if(!isValidDate(dateStr))return ''; const [y,m,d]=dateStr.split('-').map(Number); return TURKISH_DAYS[new Date(y,m-1,d).getDay()]; }
function monthNameTr(month){ return TURKISH_MONTHS[Number(month)-1]||''; }
function getYearMonth(dateStr){ if(!isValidDate(dateStr))return {year:null,month:null}; const [y,m]=dateStr.split('-').map(Number); return {year:y,month:m}; }
function formatDateTr(dateStr){ if(!isValidDate(dateStr))return dateStr||''; const [y,m,d]=dateStr.split('-'); return `${d}.${m}.${y}`; }
module.exports={TURKISH_DAYS,TURKISH_MONTHS,isValidDate,isValidTime,todayStr,dayNameTr,monthNameTr,getYearMonth,formatDateTr};
