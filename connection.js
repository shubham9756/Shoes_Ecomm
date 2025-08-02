var mysql = require('mysql')
var util = require('util')

var conn = mysql.createConnection({
    host:'bjnzoo1kgrxrxulb8dvx-mysql.services.clever-cloud.com',
    user:'uyo9cmabh4jxa3cy',
    password:'cMHF41wQVt5KJvJF2R0h',
    database:'bjnzoo1kgrxrxulb8dvx'
})

var exe = util.promisify(conn.query).bind(conn)
module.exports = exe;