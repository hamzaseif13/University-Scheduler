import searchDatabase from "./Database.js";
import { advancedSearch } from "./Database.js";

const myCourses = [],
  schedule = [];

function courseIndex(courseNum) {
  //function to search the index of a course inside #myCourses
  return myCourses.findIndex((item) => {
    return item.lineNumber === courseNum;
  });
}
function _searchFunction(val, searchBy) {
  const result = advancedSearch(
    "",
    false,
    ["second", "semester"],
    [val, searchBy, "and"]
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
  
  generatedArray = filterSchedule(generatedArray);
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
    result = addSet(result, reduceSet(set));
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

function filterSchedule(list) {
  const lengthArray = list.length;
  //days can be [sun ,mon ,tue ,wed ,thu],[sun,tue],[mon,wed],[sun mon tue wed]
  let days = [
    "Sun Mon Tue Wed Thu",
    "Sun Tue",
    "Mon Wed",
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Sat Thu",
  ];
  let interSectionIndexes = [];
  console.log("the total is " + list.length);
  for (let j = 0; j < lengthArray; j++) {
    let shedule = list[j]
    
    let sun = [],
      sat = [],
      mon = [],
      tue = [],
      wed = [],
      thu = [];
    for (let k = 0; k < shedule.length; k++) {
      if (shedule[k][0].days.includes("Sun")) {
        sun.push({ start: shedule[k][0].startTime, end: shedule[k][0].endTime });
      }
      if (shedule[k][0].days.includes("Mon")) {
        mon.push({ start: shedule[k][0].startTime, end: shedule[k][0].endTime });
      }
      if (shedule[k][0].days.includes("Tue")) {
        tue.push({ start: shedule[k][0].startTime, end: shedule[k][0].endTime });
      }
      if (shedule[k][0].days.includes("Wed")) {
        wed.push({ start: shedule[k][0].startTime, end: shedule[k][0].endTime });
      }
      if (shedule[k][0].days.includes("Thu")) {
        thu.push({ start: shedule[k][0].startTime, end: shedule[k][0].endTime });
      }
      if (shedule[k][0].days.includes("Sat")) {
        sat.push({ start: shedule[k][0].startTime, end: shedule[k][0].endTime });
      }
    }
if(j==39){
  console.log(sun)
  console.log(mon)
  console.log(tue)
  console.log(wed)
  console.log(thu)
}
    if (sun.length > 1) {
      for (let k = 0; k < sun.length; k++) {
        for (let b = k+1; b < sun.length; b++) {
          if (checkInterSection(sun[k], sun[b])) {
            
            if(!interSectionIndexes.includes(j))interSectionIndexes.push(j);
          }
        }
      }
    }

    if (mon.length > 1) {
      for (let k = 0; k < mon.length; k++) {
        for (let b = k+1; b < mon.length; b++) {
          if (checkInterSection(mon[k], mon[b])) {
            if(!interSectionIndexes.includes(j))interSectionIndexes.push(j);
          }
        }
      }
    }
    if (wed.length > 1) {
      for (let k = 0; k < wed.length; k++) {
        for (let b = k+1; b < wed.length; b++) {
          if (checkInterSection(wed[k], wed[b])) {
            if(!interSectionIndexes.includes(j))interSectionIndexes.push(j);
          }
        }
      }
    }
    if (thu.length > 1) {
      for (let k = 0; k < thu.length; k++) {
        for (let b = k+1; b < thu.length; b++) {
          if (checkInterSection(thu[k], thu[b])) {
            if(!interSectionIndexes.includes(j))interSectionIndexes.push(j);
          }
        }
      }
    }

    if (tue.length > 1) {
      for (let k = 0; k < tue.length; k++) {
        for (let b = k+1; b < tue.leingth; b++) {
          if (checkInterSection(tue[k], tue[b])) {
            if(!interSectionIndexes.includes(j))interSectionIndexes.push(j);
          }
        }
      }
    }

    if (sat.length > 1) {
      for (let k = 0; k < tue.length; k++) {
        for (let b = k+1; b < tue.length; b++) {
          if (checkInterSection(sat[k], sat[b])) {
            if(!interSectionIndexes.includes(j))interSectionIndexes.push(j);
          }
        }
      }
    }

    
  }
 
  //intersectionindexed
var counter=0;
console.log("before delete",list.length)

for(let j=0;j<lengthArray;j++){
if(interSectionIndexes.includes(j)){
list.splice(j-counter,1)
counter++;
}
}
console.log("after delete",list.length)

  return list;
}

function checkInterSection(sec1, sec2) {
 if(sec1.start==sec2.start){
   return true;
 }
 else if(sec1.start>sec2.start){
  if(sec2.end>sec1.start)return true;
  else return false;
 }
 else if (sec1.start<sec2.start){
   if(sec1.end>sec2.start)return true;
   else return false;
 }
}

export default {
  courses: myCourses,
  _addCourseFunction,
  _removeCourseFunction,
  _searchFunction,
  _generateScheduleFunction,
};
