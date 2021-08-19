import searchDatabase from "./Database.js";
import { advancedSearch } from "./Database.js";

const myCourses = [],
  schedule = [],
  options = ["all sun mon tue wed thu",830,1830];

function courseIndex(courseNum) {
  //function to search the index of a course inside #myCourses
  return myCourses.findIndex((item) => {
    return item.lineNumber === courseNum;
  });
}
function _searchFunction(val, searchBy) {
  let arr = val.split(",");
  arr = arr.map((v)=>{
    return [v,searchBy,"or"];
  })
  const result = advancedSearch(
    "",
    false,
    ...arr
  );
  return result;
}
function _addCourseFunction(courseNum) {
  //check if the course already exist
  if (courseIndex(courseNum) != -1) return;

  const course = searchDatabase(courseNum);
  myCourses.push(...course);
}
function _removeCourseFunction(courseNum) {
  let index = courseIndex(courseNum);

  if (index != -1) myCourses.splice(index, 1);
}
function _generateScheduleFunction() {
  if (myCourses.length == 0) return [];
  let tempArray = [];
  for (let j = 0; j < myCourses.length; j++) {
    tempArray.push(myCourses[j].sections);
  }

  let generatedArray = generateSchedules(...tempArray); //this array includes 15560 combinations
  //generatedArray = filterSchedule(generatedArray);
  return generatedArray;
}

function cartesianProduct(...paramArray) {
  //(...) => rest parameter (put all args in an array [paramArray])
  function addTo(curr, args) {
    let i, //always use let/const because they have better scoping (block scoping)
      copy,
      rest = args.slice(1),
      last = !rest.length,
      result = [];

    for (i = 0; i < args[0].length; i++) {
      copy = curr.slice();
      copy.push(args[0][i]);

      if (last) {
        result.push(copy);
      } else {
        result = result.concat(addTo(copy, rest));
      }
    }

    return result;
  }

  return addTo([], paramArray);
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
    
    let preSet=filterSet(reduceSet(set))
    //result=filterSet(result)
    result = addSet(result,preSet);
    result = filterSchedule(result,...options);
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

function filterSchedule(list,daysString="mon-wed",dayStart=830,dayEnd=1830) {
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

    
    if (!invalidSchedule)
    {
    filteredArray.push(list[j])
    }
      // if schedule is not invalid add it to filteredArray
  }
  // console.log(interSectionIndexes,list.length)
  // console.log(list)
  if(filteredArray.length==0){
    alert("there is no schedule with the options selected")
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

function setOptions(days,dayStart,dayEnd){
  options[0] = days;
  options[1] = dayStart;
  options[2] = dayEnd;
}

export default {
  courses: myCourses,
  _addCourseFunction,
  _removeCourseFunction,
  _searchFunction,
  _generateScheduleFunction,
  setOptions,
};
function filterSet(set){

  let filteredArray=[]
  let daysString=options[0],dayStart=options[1],dayEnd=options[2];
  for (let j = 0; j < set.length; j++) {
    let invalidTime=true;
    let invalidDay=true;
   
    for(let n=0;n<set.length;n++){
      if (set[n][0].days.length==3){
        if(daysString.includes(set[n][0].days.toLowerCase()))invalidDay=false;
        else invalidDay=true;
      }
      if (set[n][0].days.length==7){
        if(daysString.includes(set[n][0].days.slice(0,3).toLowerCase())&&daysString.includes(set[n][0].days.slice(4,8).toLowerCase()))invalidDay=false;
        else invalidDay=true;
      }
      if(set[n][0].startTime>=dayStart&&set[n][0].endTime<=dayEnd){//to check if the sections are in the time range 
        invalidTime=false;
      }
      else invalidTime=true;
  }
    if (!invalidTime&&!invalidDay)
    {
    filteredArray.push(set[j])
    }
}
return filteredArray;
}