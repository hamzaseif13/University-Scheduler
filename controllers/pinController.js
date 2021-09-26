const User = require("../models/user");
const Course = require("../models/course");
module.exports.pin_post = async (req, res) => {
  let exist = false,
  id = ""; 
  const user=res.locals.user;
  const sentArr=req.body.sentArr;
  console.log(sentArr)
  for (let j = 0; j < user.pinnedSchedule.length; j++) {
    if (user.pinnedSchedule[j].toString()==sentArr.toString()) {
      exist = true;
    }
  }  
  if(!exist){
    console.log("it doesnt exist and will be pinned")
    user.pinnedSchedule.push(sentArr);
    user.save();

  } 
  console.log(user.pinnedSchedule)
};
module.exports.unpin_delete = async (req, res) => {
  const user= res.locals.user;
  const del= req.body.del;
  for (let j = 0; j < user.pinnedSchedule.length; j++) {
    if (user.pinnedSchedule[j].toString()==del.toString()) {
      user.pinnedSchedule.splice(j,1)
      user.save()
      console.log("deleted")
    }
  } 
  console.log(user.pinnedSchedule)
};

module.exports.getpinned_get=async (req, res) => {
  const user = res.locals.user;
  const prePin = user.pinnedSchedule;
  let finalArr=[];
  for (let j = 0; j < prePin.length; j++) {
    let schedule = prePin[j];
    let tempArr=[];
    for (let i = 0; i < schedule.length; i++) {
      let sectionNum= parseInt(schedule[i].replace(/^.*-/, ""));
      let symbol = schedule[i].replace(/-.*$/,"");
      let lcourse = await Course.findOne({ symbol });
      let section;
      for(let m=0;m<lcourse.sections.length;m++){
          if(lcourse.sections[m].sectionNumber==sectionNum){
              section=lcourse.sections[m]
          }
      }
      let sectObj = {
        course:{
            creditHours:lcourse.creditHours,
            department: lcourse.department,
            faculty: lcourse.faculty,
            lineNumber: lcourse.lineNumber,
            name: lcourse.name,
            semester: lcourse.semester,
            symbol: lcourse.symbol,
            _id: lcourse.id
        },
        sectionNumber: section.sectionNumber,
        days: section.days,
        hall:section.hall,
        seatCount: section.seatCount,
        capacity: section.capacity,
        registered:section.registered,
        instructor: section.instructor,
        status: section.status,
        teachingType: section.teachingType,
        startTime: section.startTime,
        endTime: section.endTime,
      };
      tempArr.push([sectObj]);
    }
    finalArr.push(tempArr)
  }
  
  res.json(finalArr);
};