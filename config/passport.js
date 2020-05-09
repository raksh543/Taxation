var passport=require('passport');
var mongoose=require('mongoose')
var UserSchema=require('../public/models/userschema')
var validator = require('express-validator')
var LocalStrategy=require('passport-local').Strategy;
var passport = require('passport')
var nodemailer = require('nodemailer')
var GooglePlusTokenStrategy= require ('passport-google-plus-token')

//-------------------for login with google account------------
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: '895883019505-vn912g4nrg5jk07d3q9mfu2fu24t3ie6.apps.googleusercontent.com',
    clientSecret: 'nsJgCl_vxttK5zPG2y7LM5Ni',
    callbackURL: "http://www.example.com/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
      token= '1//04oJIPfiQmI9uCgYIARAAGAQSNwF-L9Ir7jWLhUtUjPZJJEh3G-Z2viQvPZg88CK4XIG3OB0sg6ASdPA0uyC517YSGQqUN_kYb94'
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
          console.log(profile)
        return done(err, user);
      });
  }
));



//----------------------For login using local strategy------------------
var Member=mongoose.model("Member",UserSchema);
passport.serializeUser(function(user,done){
    done(null,user.id)
})

passport.deserializeUser(function(id, done){
    Member.findById(id, function(err, user){
        done(err,user)
    })
})

passport.use('local.signup', new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
},function(req, email, password, done){
    req.checkBody('email','Invalid email').notEmpty().isEmail();
    req.checkBody('password','Invalid password').notEmpty().isLength({min:7});

    // var errors = req.validateErrors();
    // if(errors){
    //     var messages = [];
    //     errors.forEach(function(error){
    //         messages.push(error.msg);
    //     })
    //     return done(null, false, req.flash('error',messages))
    // }
    Member.findOne({'email':req.body.email}, function(err, user){
        if(err){
            return done(err)
        }
        if(user){
            return done(null, false, {message:'Email is already in use.'})
        }
        var newUser=new Member(); 
        newUser.fname=req.body.fname;
        newUser.lname=req.body.lname;
        newUser.email=req.body.email;
        newUser.password=newUser.encryptPassword(req.body.password);
        if(req.body.password==req.body.passwordTwo){
            newUser.save(function(err, result){
                if(err){
                    return done(err)
                }
                return done(null, newUser)
                
            })
        }else{
            return done(null, false, {message:'Passwords do not match.'})
        }
        
        
    })
}))


passport.use('local.signin', new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true

},function(req,res, password, done){
    req.checkBody('email','Invalid email').notEmpty().isEmail();
    req.checkBody('password','Invalid password').notEmpty();
    
    // var errors = req.getValidationResult()
    // if(errors){
    //     var messages = [];
    //     errors.forEach(function(error){
    //         messages.push(error.msg);    
    //     })
    //     return done(null, false, req.flash('error',messages))
    // }

    Member.findOne({'email':req.body.email}, function(err, user){
        if(err){
            return done(err)
        }
        if(!user){
            return done(null, false, {message:'No user found.'})
        }
        if(!user.validPassword(password)){
            return done(null, false, {message:'Wrong password.'})
        }
        return done(null, user)
        
    })
}))
