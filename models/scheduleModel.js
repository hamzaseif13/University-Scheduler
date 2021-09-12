const mongoose = require("mongoose")
const scheduleSchema=mongoose.Schema({
    sections:{type:Array,required:true,unique:true}
})

const Schedule= mongoose.model("schedules",scheduleSchema)
module.exports=Schedule;