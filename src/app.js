// git push heroku feature:master
const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const bcrypt = require('bcryptjs')
const path = require('path')
var mongoose = require('mongoose')
var validator = require('express-validator')
//var csrf = require('csurf')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var passport = require('passport')
var flash = require('connect-flash')
var MongoStore = require('connect-mongo')(session)

mongoose.connect("mongodb+srv://monchu:monchu@cluster0-dgfgi.mongodb.net/Taxation?retryWrites=true&w=majority", { useNewUrlParser: true });//creating or joining to practice database


const UserSchema = require('../public/models/userschema')

const app = express()

const port = process.env.PORT || 3080

const publicDirectoryPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')


app.set('view engine', 'hbs')
app.set('views', viewPath)
hbs.registerPartials(partialsPath)

// app.use('/admin', adminRouter)
app.use(express.static(publicDirectoryPath))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(validator())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session(
    {
        secret: 'coz-i-cab-not-decide-a-super-long-password',
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        cookie: { maxAge: 60 * 60 * 1000 }
    }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
// app.use(apiRoute)
app.use((req, res, next) => {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
})

require('../config/passport')

app.get('/', (req,res,next)=>{
    res.render('index')
})

// var csrfProtection = csrf();
// app.use(csrfProtection)

app.get('/logout', isLoggedIn, (req, res, next) => {
    req.logout();
    res.redirect('/')
})

app.get('/signup', (req,res,next)=>{
    var messages = req.flash('error')
    res.render('signup', {
        messages: messages,
        hasErrors: messages.length > 0
    })
})

app.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/signup',
    failureFlash: true
}), function (req, res, next) {
        res.redirect('/');
})

app.get('/login', (req,res,next)=>{
    var messages = req.flash('error')
    res.render('login', {
        messages: messages,
        hasErrors: messages.length > 0
    })
})

app.post('/login', passport.authenticate('local.signin', {
    failureRedirect: '/login',
    failureFlash: true
}), function (req, res, next) {
        res.redirect('/')
})

app.get('*', (req, res) => {
    res.render('404', {
        title: '404',
        name: 'Rakshita Jain',
        errorMessage: 'Page not found'
    })
})

app.listen(port, () => {
    console.log('Server is up on the port' + port)
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');

}