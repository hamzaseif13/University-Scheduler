const mongoose = require("mongoose")
const scheduleSchema=mongoose.Schema({
    sections:{type:Array}
})

const Schedule= mongoose.model("schedules",scheduleSchema)
module.exports=Schedule;