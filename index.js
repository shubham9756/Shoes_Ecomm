var express =require('express')
var bodyparser =require('body-parser')
var upload = require('express-fileupload')
var session = require('express-session')
var admin_route = require('./routes/admin_route')
var user_route = require('./routes/user_route')
var admin_login = require('./routes/admin_login')
const cookieParser = require('cookie-parser');
require('dotenv').config()
var app =express()
app.use(cookieParser());

app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static('public/'))
app.use(upload())
app.use(session({
    secret:'qwertyi',
    resave:true,
    saveUninitialized:true
}))
app.use('/',user_route)
app.use('/admin',admin_route)
app.use('/admin_login',admin_login)

app.listen(process.env.PORT || 1000)