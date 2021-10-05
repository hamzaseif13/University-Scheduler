let options;

function generate(sections,opt) {
  options=opt;
  
  if (sections.length == 0) return [];
  
  return generateSchedules(sections);
}
function generateSchedules(sets) {
  const copy = [...sets];
  copy.sort((a,b)=>{
    return b.length - a.length;
  });
  function addSet(mainSet, set) {
    const arr = [];
    if (mainSet.length == 0) mainSet.push([]);
    for (const itemArr of mainSet) {
      for (const item of set) {
        arr.push([...itemArr, item]);
      }
    }
    return arr;
  }
  function reduceSet(set) {
    //sorts then put courses with the same time together (greatly reduce the number of combinations)
    const copy = [...set];
    const result = [];
    copy.sort((a, b) => {
      let result = a.endTime - b.endTime;
      if(result)
        return result;
      
      if(a.days === b.days)
        return a.sectionNumber - b.sectionNumber;
      
      return (a.days[0] > b.days[0])? 1 : -1;
    });
    for (let i = 0; i < copy.length; ) {
      let item = copy[i];
      const arr = [];

      while (
        i < copy.length &&
        item.endTime === copy[i].endTime &&
        item.days === copy[i].days
      ) {
        arr.push(copy[i]);
        i++;
      }
      result.push(arr);
    }
    return result;
  }
  function sortByScore(arr){
    arr.sort((a, b)=>{
      return calcScore(a) - calcScore(b);
    })
  }
  // let l = 1;
  let result = [];
  for (let set of copy) {
    // l *= set.length;
    set = filterSet(reduceSet(set));
    result = addSet(result, set);
    result = filterSchedule(result, ...options);
    sortByScore(result);
    if(result.length > 1000)
      result = result.slice(0,1000);
    if (result.length === 0)
      return [];
  }
  // console.log(
  //   "Courses: ",
  //   sets.length,
  //   "\nnot reduced: ",
  //   l,
  //   "\nreduced: ",
  //   result.length
  // );

  return result;
}
function filterSchedule(list) {
  const lengthArray = list.length;
  let filteredArray = [];
  for (let j = 0; j < lengthArray; j++) {
    let schedule = list[j].map((val) => {
      return val[0];
    }); // to change array of sections to a section
    let invalidSchedule = false;

    let sun = [],
      sat = [],
      mon = [],
      tue = [],
      wed = [],
      thu = [];
    for (let k = 0; k < schedule.length; k++) {
      if (schedule[k].days.includes("Sun")) {
        sun.push({ start: schedule[k].startTime, end: schedule[k].endTime });
      }
      if (schedule[k].days.includes("Mon")) {
        mon.push({ start: schedule[k].startTime, end: schedule[k].endTime });
      }
      if (schedule[k].days.includes("Tue")) {
        tue.push({ start: schedule[k].startTime, end: schedule[k].endTime });
      }
      if (schedule[k].days.includes("Wed")) {
        wed.push({ start: schedule[k].startTime, end: schedule[k].endTime });
      }
      if (schedule[k].days.includes("Thu")) {
        thu.push({ start: schedule[k].startTime, end: schedule[k].endTime });
      }
      if (schedule[k].days.includes("Sat")) {
        sat.push({ start: schedule[k].startTime, end: schedule[k].endTime });
      }
    }

    if (sun.length > 0) {
      for (let k = 0; k < sun.length - 1; k++) {
        for (let b = k + 1; b < sun.length; b++) {
          //b = k+1 => do not check the section with itself
          if (checkInterSection(sun[k], sun[b])) {
            // interSectionIndexes.push(j);
            invalidSchedule = true;
          }
        }
      }
    }
    if (mon.length > 0) {
      for (let k = 0; k < mon.length - 1; k++) {
        for (let b = k + 1; b < mon.length; b++) {
          if (checkInterSection(mon[k], mon[b])) {
            // interSectionIndexes.push(j);
            invalidSchedule = true;
          }
        }
      }
    }
    if (wed.length > 0) {
      for (let k = 0; k < wed.length - 1; k++) {
        for (let b = k + 1; b < wed.length; b++) {
          if (checkInterSection(wed[k], wed[b])) {
            // interSectionIndexes.push(j);
            invalidSchedule = true;
          }
        }
      }
    }
    if (thu.length > 0) {
      for (let k = 0; k < thu.length - 1; k++) {
        for (let b = k + 1; b < thu.length; b++) {
          if (checkInterSection(thu[k], thu[b])) {
            // interSectionIndexes.push(j);
            invalidSchedule = true;
          }
        }
      }
    }
    if (tue.length > 0) {
      for (let k = 0; k < tue.length - 1; k++) {
        for (let b = k + 1; b < tue.length; b++) {
          if (checkInterSection(tue[k], tue[b])) {
            // interSectionIndexes.push(j);
            invalidSchedule = true;
          }
        }
      }
    }
    if (sat.length > 0) {
      for (let k = 0; k < tue.length - 1; k++) {
        for (let b = k + 1; b < tue.length; b++) {
          if (checkInterSection(sat[k], sat[b])) {
            // interSectionIndexes.push(j);
            invalidSchedule = true;
          }
        }
      }
    }

    let numberOfDays = 0;
    if(sun.length)numberOfDays++;
    if(mon.length)numberOfDays++;
    if(tue.length)numberOfDays++;
    if(wed.length)numberOfDays++;
    if(thu.length)numberOfDays++;

    if (!invalidSchedule && numberOfDays <= options[1]) {//options[1] -> daysNum (user)
      filteredArray.push(list[j]);
    }
    // if schedule is not invalid add it to filteredArray
  }
  if (filteredArray.length == 0) {
    console.log("no schedule")
    return [];
  }
  return filteredArray;
}

function checkInterSection(sec1, sec2) {
  if (sec1.start == sec2.start) {
    return true;
  }
  if (sec1.start < sec2.start) {
    if (sec1.end > sec2.start) return true;
    else if (sec1.end <= sec2.start) return false;
  } else if (sec1.start > sec2.start) {
    if (sec2.end > sec1.start) return true;
    else if (sec2.end <= sec1.start) return false;
  }
}
function filterSet(set){
    const filteredArray = [];
    
    
    let daysString=options[0],dayStart=options[2],dayEnd=options[3],openSectionsFlag = options[4];
  
    daysString = daysString.toLowerCase();
  
    for(let i=0,l=set.length ; i < l ;i++){
      const sec = set[i][0];
      let invalid = false;
  
      if(!daysString.includes("all")){
        const days = sec.days.toLowerCase().split(" ");
        for (const day of days) {
          if(!daysString.includes(day)){
            invalid = true;
            break;
          }
        }
      }
      if(sec.startTime < dayStart || sec.endTime > dayEnd){
        invalid = true;
        continue;
      }

      if(openSectionsFlag && parseInt(sec.capacity) <= parseInt(sec.registered)){
        invalid = true;
      }

      
  
      if(!invalid)
        filteredArray.push(set[i]);
    }
    return filteredArray;
}

function calcScore(schedule){
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Sat"];
    const daysArr = {
        Sun:[],
        Mon:[],
        Tue:[],
        Wed:[],
        Thu:[],
        Sat:[]
    };  

    for(const day of weekDays){
        for(let sec of schedule){
            sec = sec[0];
            if(sec.days.includes(day))
                daysArr[day].push(sec);
        }
    }
    let identicalDays = true;
    let score = 0;
    let sumUniT = 0;
    let sumDays = 0;
    let uniTArr = [];
    for (const day of weekDays) {
        if(daysArr[day].length > 0){
            daysArr[day] = dayStats(daysArr[day]);
            score -= daysArr[day].studyPer*10;//better score if most of your school day is not free
            sumUniT += daysArr[day].uniT; // worse score for longer school days
            sumDays++;
            uniTArr.push(daysArr[day].uniT);
        }
        else
            score -= 10000; //better score for less days per week

        // if(!schoolDays.includes("all") && schoolDays.includes(day.toLowerCase())){
        //     if(identicalDays && daysArr[day].length === 0){
        //         identicalDays = false;
        //     }
        // }
    }
    //this make the score higher(worse) if the time spent in the university is very different between school days (high variance)
    let avg = sumUniT/sumDays;
    score += Math.sqrt(uniTArr.reduce((sum,val)=>{
        return sum + (val - avg)**2;
    },0)/sumDays);

    // if(!schoolDays.includes("all") && identicalDays)
    //     score -= 20000;//better score if the school days are exactly as inputed by user

    return ~~score;//round num
}
function dayStats(dayArr){
    // if(dayArr.length == 0)
    //     return 200;
    dayArr.sort((a,b)=>{
        return a.endTime - b.endTime;
    });

    const uniT = dayArr[dayArr.length - 1].endTime - dayArr[0].startTime;
    
    let studyT = 0;
    for (const sec of dayArr) {
        studyT += sec.endTime - sec.startTime;;
    }
    let obj = {uniT: uniT , studyPer: studyT/uniT * 100};
    // console.log(obj);
    return obj;
}
module.exports = generate;