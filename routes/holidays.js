const express=require('express');const router=express.Router();
const {readHolidays,writeHolidays,generateId}=require('../storage/fileStorage');
const {addAuditLog}=require('../utils/auditLog');
router.get('/',(req,res)=>res.render('holidays/index',{title:'Tatiller',holidays:readHolidays()}));
router.post('/',(req,res)=>{let h=readHolidays();h.push({id:generateId('holiday'),date:req.body.date,name:req.body.name});writeHolidays(h);addAuditLog('HOLIDAY_CREATE',req.body.name);res.redirect('/holidays')});
module.exports=router;
