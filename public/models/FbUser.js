const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
    fbId:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
});

const FbUser=mongoose.model('FbUser',UserSchema);
module.exports=FbUser;