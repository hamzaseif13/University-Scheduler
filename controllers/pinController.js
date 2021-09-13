const User=require("../models/user")

const Schedule=require("../models/scheduleModel")

module.exports.pin_post=async(req,res)=>{
    let exist=false,id="";
    const user =await User.findById(res.locals.user._id)
    const sch =  await  Schedule.find()
    for(let j=0;j<sch.length;j++){
        if(sch[j].sections.toString()==req.body.sentArr.toString()){
            exist=true;
            id=sch[j].id;
    }}

    if(!exist) {
        try{
            console.log("it doesnt exist it gonna be saved in db")
            const nsch=new Schedule({sections:req.body.sentArr})
            nsch.save()
            id=nsch.id;
        }
       catch(err){console.log(err)}
    }
    const pinnedSch=user.pinnedSchedule;
    if(pinnedSch.includes(id))console.log("user already has that schdule pinned ")
    else{
        try{
            console.log('user doesnt have that schdeule willbe added ')
            user.pinnedSchedule.push(id)
            user.save()
        }
        catch(err){
            console.log(err)
        }
    }
}