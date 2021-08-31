const mongoose=require("mongoose")
const Schema = mongoose.Schema;
const Car=require("./Car")
const userSchema=new Schema({
    name:{
        type:String,required:true
    },
    age:{
        type:Number,required:true
    },
    car:{
        type:Car,required:true
    }
    
});
const User=mongoose.model("User",userSchema);
module.exports=User;