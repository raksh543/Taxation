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
var renewRoute = require('../public/routes/renewPassword')


FacebookStrategy = require('passport-facebook').Strategy;

mongoose.connect("mongodb+srv://monchu:monchu@cluster0-dgfgi.mongodb.net/Taxation?retryWrites=true&w=majority", { useNewUrlParser: true });//creating or joining to practice database


const UserSchema = require('../public/models/userschema')
const FbUser = require('../public/models/FbUser')

const adminRouter = require('../public/routes/admin-router')

const app = express()

const port = process.env.PORT || 3080

const publicDirectoryPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')


app.set('view engine', 'hbs')
app.set('views', viewPath)
hbs.registerPartials(partialsPath)

app.use('/admin', adminRouter)
app.use(express.static(publicDirectoryPath))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(validator())
app.use(bodyParser.json())
app.use(cookieParser())

var Member = mongoose.model("Member", UserSchema);

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
app.use(renewRoute)

require('../config/passport')

app.get('/', (req, res, next) => {
    res.render('index')
})

////////////////////////////////////////////
//facebook auth
app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function (req, res) {
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    });

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
        console.log

        //store data to db
        const User = new FbUser({
            fbId: req.user.id,//You need to pass some value here from where fb id is coming   ok Yes 
            name: req.user.displayName
        });
        User.save()
            .then(user => {
                res.redirect('/index');
            })
            .catch(err => console.log(err));
        console.log(req.user);
        res.redirect('/index');  //Here we have to mention dashboard after success full login but simply for the 
    });

app.get('/index', isLoggedIn, function (req, res) {
    //console.log(req.user);
    res.render('index', { user: req.user });
});


////////////////////////////////////////////

// var csrfProtection = csrf();
// app.use(csrfProtection)

app.get('/logout', isLoggedIn, (req, res, next) => {
    req.logout();
    res.redirect('/')
})

//--------------------------------------------------login with google-------------------------------------------

app.get('/auth/google',
  passport.authenticate('google', { scope: 
      [ 'https://www.googleapis.com/auth/plus.login',
      , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

app.get( '/auth/google/callback', 
    passport.authenticate( 'google', { 
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));
//--------------------------------------------------login with google ends-------------------------------------------

app.get('/signup', (req, res, next) => {
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

app.get('/login', (req, res, next) => {
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
// app.post('/googlesignin', passport.authenticate('signinbygoogle', {
//     failureRedirect: '/login',
//     failureFlash: true
// }), function (req, res, next) {
//     res.redirect('/')
// })

app.post('/googlesignin', (req, res, next) => {
    console.log(req.body.Gid)
    console.log(req.body.Gemail)
    useremail = req.body.Gemail
    Member.findOne({ 'email': useremail }, (err, user) => {
        if (user) {
            console.log("here")
            console.log(req.isAuthenticated())
            // req.isAuthenticated() == true
            res.redirect('/login')
        }
        if (!user) {
            console.log("nouser")
            var newUser = new Member();
            newUser.fname = req.body.Gfname;
            newUser.lname = req.body.Glname;
            newUser.email = req.body.Gemail;
            newUser.password = newUser.encryptPassword(req.body.Gpass);
            newUser.save()
            res.redirect('/login')
        }
    })
    console.log("ryasjh")
})

// app.post('/googlesignin', (req,res,next)=>{
//     console.log(req.body.Gid)
//     console.log("ryasjh")
// })

app.get('/forgot', (req, res, next) => {
    res.render('forgot')
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