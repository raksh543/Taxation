var passport=require('passport');
var mongoose=require('mongoose')
var UserSchema=require('../public/models/userschema')
var validator = require('express-validator')
var LocalStrategy=require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var passport = require('passport')
var nodemailer = require('nodemailer')
var GooglePlusTokenStrategy= require ('passport-google-plus-token')
var CustomStrategy = require('passport-custom').Strategy

//-------------------for login with google account------------
// var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


const FbUser = require('../public/models/FbUser');


var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;





passport.use(new GoogleStrategy({
    clientID: '895883019505-vn912g4nrg5jk07d3q9mfu2fu24t3ie6.apps.googleusercontent.com',
    clientSecret: 'nsJgCl_vxttK5zPG2y7LM5Ni',
    callbackURL: "http://localhost:3080/auth/google/callback"
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
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

// passport.use('signinbygoogle', new CustomStrategy({
//     usernameField:'Gemail',
//     passwordField:'Gpass'
// },
//     function(req, done) {
//         Member.findOne({ 'email': useremail }, (err, user) => {
//             if (user) {
//                 console.log("here")
//                 console.log(req.isAuthenticated())
//                 // req.isAuthenticated() == true
//                 return done(null, user)
//             }
//             if (!user) {
//                 console.log("nouser")
//                 var newUser = new Member();
//                 newUser.fname = req.body.Gfname;
//                 newUser.lname = req.body.Glname;
//                 newUser.email = req.body.Gemail;
//                 newUser.password = newUser.encryptPassword(req.body.Gpass);
//                 newUser.save()
//                 return done(null, newUser)
//             }
//         })
//       // Do your custom user finding logic here, or set to false based on req object
//     //   callback(null, user);
//     }
//   ));


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

// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
    clientID: "523967331607372",
    clientSecret: " f2a7fc550bf17c1d7b87ff6451c9e96c",
    callbackURL: "http://localhost:3080/auth/facebook/callback"
},
    function (accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

passport.use('local.Gsignin', new LocalStrategy({
    usernameField:'email',
    // passwordField:'password',
    passReqToCallback:true

},function(req,res, password, done){
    // req.checkBody('email','Invalid email').notEmpty().isEmail();
    // req.checkBody('password','Invalid password').notEmpty();

    Member.findOne({'email':req.body.Gemail}, function(err, user){
        if(err){
            return done(err)
        }
        if(!user){
            return done(null, false, {message:'No user found.'})
        }
        // if(!user.validPassword(password)){
        //     return done(null, false, {message:'Wrong password.'})
        // }
        return done(null, user)
        
    })
}))


