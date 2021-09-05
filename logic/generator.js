var options;
function generate(courses,opt) {
    options=opt;
  if (courses.length == 0) return [];
  let tempArray = [];
  for (let j = 0; j < courses.length; j++) {
    tempArray.push(courses[j].sections);
  }

  let generatedArray = generateSchedules(...tempArray); //this array includes 15560 combinations
  //generatedArray = filterSchedule(generatedArray);
  return generatedArray;
}
function generateSchedules(...sets) {
  //with loops instead of recursion
  const copy = [...sets];
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
      return a.endTime - b.endTime;
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
  let l = 1;
  let result = [];
  for (const set of copy) {
    let preSet = filterSet(reduceSet(set));
    //result=filterSet(result)
    result = addSet(result, preSet);
    result = filterSchedule(result, ...options);
    if (result.length === 0)
      //bug fix
      return [];
    l *= set.length;
  }
  console.log(
    "Courses: ",
    sets.length,
    "\nnot reduced: ",
    l,
    "\nreduced: ",
    result.length
  );

  //result=filterSchedule(result);
  return result;
}
function filterSchedule(
  list,
  daysString = "mon-wed",
  dayStart = 830,
  dayEnd = 1830
) {
  //the days var can be array of days ex. ["sun","tue","thu"] or a string ex. monwed , suntuethu
  const lengthArray = list.length;
  //days can be [sun ,mon ,tue ,wed ,thu],[sun,tue],[mon,wed],[sun mon tue wed]
  let filteredArray = []; // this must be outside the for loop to access it (return filteredArray;) (read about let/const and closures in ES6)
  let interSectionIndexes = [];
  console.log("the total is " + list.length);
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

    if (!invalidSchedule) {
      filteredArray.push(list[j]);
    }
    // if schedule is not invalid add it to filteredArray
  }
  // console.log(interSectionIndexes,list.length)
  // console.log(list)
  if (filteredArray.length == 0) {
    alert("there is no schedule with the options selected");
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
    
    let daysString=options[0],dayStart=options[1],dayEnd=options[2];
  
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
  
      if(!invalid)
        filteredArray.push(set[i]);
    }
    return filteredArray;
  }
module.exports = generate;
