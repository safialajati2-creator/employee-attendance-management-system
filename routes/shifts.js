const express=require('express');const router=express.Router();
const {readShifts,writeShifts,generateId}=require('../storage/fileStorage');
const {addAuditLog}=require('../utils/auditLog');
router.get('/',(req,res)=>res.render('shifts/index',{title:'Çalışma Programları',shifts:readShifts()}));
router.post('/',(req,res)=>{let s=readShifts();s.push({id:generateId('shift'),name:req.body.name,start:req.body.start,end:req.body.end,saturdayStart:req.body.saturdayStart||req.body.start,saturdayEnd:req.body.saturdayEnd||req.body.end,tolerance:Number(req.body.tolerance||10)});writeShifts(s);addAuditLog('SHIFT_CREATE',req.body.name);res.redirect('/shifts')});
module.exports=router;
