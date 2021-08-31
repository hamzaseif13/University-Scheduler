const mongoose=require("mongoose")
const Schema = mongoose.Schema;

const carSchema=new Schema({
    made:{
        type:String,required:true
    },
    year:{
        type:Number,required:true
    }
});
const Car=mongoose.model("Car",carSchema)
module.exports=Car;