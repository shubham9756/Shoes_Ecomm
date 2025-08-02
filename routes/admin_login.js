var express = require('express');
const { route } = require('./admin_route');
var router = express.Router()
var exe = require('./../connection')

router.get('/',function(req,res){
    res.render('admin/login.ejs')
})
router.post('/login',async function(req, res) {
    var d = req.body;
    var sql = `SELECT * FROM admin WHERE admin_mobile = '${d.username}' AND admin_password =  '${d.password}'`;
    var result = await exe(sql);
    console.log(result)
    
    if (result.length > 0) {
        req.session.admin = result[0];
        res.redirect('/admin');
    } else {
        res.render('admin/login.ejs', { error: 'Invalid Email or Password' });
    }
});

module.exports = router