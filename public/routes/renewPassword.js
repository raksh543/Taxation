var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var nodemailer = require('nodemailer')
var bcrypt=require('bcrypt-nodejs')

const UserSchema = require('../models/userschema')

var Member = mongoose.model("Member", UserSchema);

var val = 0
var useremail = null

router.get('/forgetPassOne', (req, res, next) => {
    res.render('forgetPassOne')
})

router.post('/sendOTP', (req, res, next) => {
    useremail = req.body.email
    val = Math.floor(1000 + Math.random() * 9000);
    console.log(val);
    const output = `
        <h3> Dear user</h3>
        <p>Here is the verification code to reset your passsword:</p>`
        + val +
        `<p> Use this code to reset your password.</p>`


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
        from: '"Taxation " <justfordemo999@gmail.com>', // sender address
        to: useremail, // list of receivers
        subject: "Reset Password ✔", // Subject line
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
    res.redirect('/enterotp');
    // console.log(passport)

})

router.get('/enterotp',(req,res)=>{
    res.render('enterotp')
})

router.post('/matchOTP', (req,res,next)=>{
    
    var enteredVal=req.body.otp;
    console.log("Entered is" + enteredVal)
    console.log("Initial is " + val)
    if(enteredVal == val){
        res.redirect('/enterNewPassword')
    }
})

router.get('/enterNewPassword',(req,res)=>{
    res.render('enterNewPassword')
})

router.post('/updatePass',(req,res)=>{
    var userid= "rakshitajain777@gmail.com"
    console.log(userid)

    Member.findOne({'email': userid}, (err, user)=>{
        console.log(user)

    });

    // var passnew =user.encryptPassword(req.body.newPass);
    // console.log(passnew);
    encrypted = bcrypt.hashSync(req.body.newPass, bcrypt.genSaltSync(5), null)
    Member.updateOne({email: userid}, 
        {password : encrypted},(err,result)=>{
            if(err){
                res.send(err)
            }else{
                console.log("//////////////////////////////////////////////"+result)
            }
        }
        
        
    )
        
    res.redirect('/login')
})


module.exports = router