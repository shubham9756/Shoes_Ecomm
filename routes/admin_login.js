var express = require('express');
const { route } = require('./admin_route');
var router = express.Router()
var exe = require('./../connection')

router.get('/',function(req,res){
    res.render('admin/login.ejs')
})
router.post('/login',async function(req,res){
    var d = req.body;
    var sql = `SELECT * FROM customers WHERE customer_email = ? AND customer_mobile = ?`
    var result = await exe(sql,[d.username,d.password])        
    if(result.length > 0){
        req.session.admin = result[0]
        res.redirect('/admin')
    }
    else{
        res.render('admin/login.ejs',{error:'Invalid Email or Password'})   
    }
    })
module.exports = router