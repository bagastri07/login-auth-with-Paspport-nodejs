const mysql = require('mysql')
const db_config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_login'
}

var con = mysql.createConnection(db_config)

con.connect((err) => {
    if(err) {
        console.log('error connecting to database:' + err.stack)
    }
    console.log('Connected as id ' + con.threadId)
})

module.exports = con