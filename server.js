if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const db = require('./conn')
const request = require('request')

const initializePassport = require('./passport-config')
const { json } = require('express')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

var users = [];

function setValue(value) {
    users = value;
    console.log(users);
}

app.set('view-engine', 'ejs')
app.use(express.urlencoded( { extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthencticated, (req, res) => {
    res.render('login.ejs')
    db.query('SELECT * FROM tb_user', (err, result) => {
        if(err) {
            console.log(err);
        } else {
            //console.log(result)
            setValue(JSON.parse(JSON.stringify(result)));
        }
    })
})

app.post('/login', checkNotAuthencticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthencticated,  (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthencticated, async (req, res) => {
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        let data = {
            name: req.body.name,
            email: req.body.email,
            password: hashPassword
        }
        let queryString = 'INSERT INTO tb_user SET ?'
        db.query(queryString, data, (err, result) => {
            if (err){
                res.send({msg: err})
            }
        })
        res.redirect('/login')
    } catch {
        res.redirect('register')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthencticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3003, () => {
    console.log('Listening at 3003')
})