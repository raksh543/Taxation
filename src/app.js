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
var nodemailer = require('nodemailer')
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

//--------------------------------------------------login with google-------------------------------------------

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authorization, Google will redirect the user
//   back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }))

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/')
  })
//--------------------------------------------------login with google ends-------------------------------------------

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

app.get('/forgot',(req,res,next)=>{
    res.render('forgot')
})

app.get('/forgetPassOne',(req,res,next)=>{
    res.render('forgetPassOne')
})

app.post('/sendOTP', (req,res,next)=>{
    const email = req.body.email
        const output = `
        <h3> Dear user</h3>
        <p>You have successfully logged in.</p>
        <p> Jump in right now and explore the products and get amazing offers.</p>`;


        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'justfordemo999@gmail.com', // generated ethereal user
                pass: 'justfordemo999@work' // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // send mail with defined transport object
        let mailOptions = {
            from: '"Taxation 👻😀" <justfordemo999@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Hello ✔🤗", // Subject line
            text: "Hello world?", // plain text body
            html: output // html body
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error)
            }
            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        })
        res.redirect('/profile');
        // console.log(passport)
    
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