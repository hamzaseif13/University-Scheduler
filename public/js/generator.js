import calcScore from "./Calculate Score.js";
const myCourses = [],
  options = ["all",8.5,18.5];

function courseIndex(courseNum) {
  //function to search the index of a course inside #myCourses
  return myCourses.findIndex((item) => {
    return item.lineNumber === courseNum;
  });
}
//feature functions (invoked with user events)
function _addCourseFunction(course) {
  //check if the course already exist
  if (courseIndex(course.lineNumber) != -1) return;

  //add necessery props for sections
  course.sections = course.sections.map((val)=>{
    const copy  = {...course};
    copy.sections = undefined;
    val.course = copy;
    return val;
  });
  myCourses.push(course);
}
function _removeCourseFunction(courseNum) {
  let index = courseIndex(courseNum);

  if (index != -1) myCourses.splice(index, 1);
}

async function _searchFunction(val, searchBy, abortSignal) {
  return await searchDatabase(val, searchBy, abortSignal);
  
  // let arr = val.split(",");
  // arr = arr.map((v)=>{
  //   return [v,searchBy,"or"];
  // })
  // const result = advancedSearch(
  //   "",
  //   false,
  //   ...arr
  // );
  // return result;
}
async function _generateScheduleFunction() {
  if (myCourses.length == 0) return [];
  let tempArray = [];
  for (let j = 0; j < myCourses.length; j++) {
    tempArray.push(myCourses[j].sections);
  }
  
  const generatedArray = await generateSchedules_Server(tempArray); //switch between server/client processing
  return generatedArray;
}

//utility functions (for dev use)
async function searchDatabase(val, searchBy ,abortSignal = null){
  const searchObj = {};
  searchObj.value = val;
  searchObj.searchBy = searchBy;
  const res = await fetch("getCourse", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchObj),
    signal: abortSignal
  })
  return await res.json();
}
async function generateSchedules_Server(arr){
  console.log("Generate on Server");
  const res = await fetch("gen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ arr, options }),
  });
  // data is the response object coming from server 
  const data = await res.json();
  return data.rec;
}
async function getUserPinned(){
  const res = await fetch("getpinned", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  const arr = await res.json();
  
  return arr;
  // return [
  //   [
  //     [
  //         {
  //             "sectionNumber": "4",
  //             "days": "Mon Wed",
  //             "hall": "منصة الكترونية",
  //             "seatCount": "500",
  //             "capacity": "20",
  //             "registered": "20",
  //             "instructor": "عمر عبدالكريم مناور الزعبي",
  //             "status": "Active",
  //             "teachingType": "by an Electronic Platform",
  //             "startTime": 10,
  //             "endTime": 11.5,
  //             "course": {
  //                 "_id": "612e6607a85ea169dbdface2",
  //                 "semester": "Second Semester 2020-2021",
  //                 "faculty": "Computer & Information Technology",
  //                 "department": "Computer Science",
  //                 "lineNumber": "1732112",
  //                 "symbol": "CS211",
  //                 "name": "DATA STRUCTURES",
  //                 "creditHours": "3",
  //                 "__v": 0
  //             },
  //             "timeObj": {
  //                 "start": {},
  //                 "end": {}
  //             }
  //         },
  //         {
  //             "sectionNumber": "8",
  //             "days": "Mon Wed",
  //             "hall": "منصة الكترونية",
  //             "seatCount": "500",
  //             "capacity": "25",
  //             "registered": "26",
  //             "instructor": "سناء خالد محمد بصول",
  //             "status": "Active",
  //             "teachingType": "by an Electronic Platform",
  //             "startTime": 10,
  //             "endTime": 11.5,
  //             "course": {
  //                 "_id": "612e6607a85ea169dbdface2",
  //                 "semester": "Second Semester 2020-2021",
  //                 "faculty": "Computer & Information Technology",
  //                 "department": "Computer Science",
  //                 "lineNumber": "1732112",
  //                 "symbol": "CS211",
  //                 "name": "DATA STRUCTURES",
  //                 "creditHours": "3",
  //                 "__v": 0
  //             },
  //             "timeObj": {
  //                 "start": {},
  //                 "end": {}
  //             }
  //         }
  //     ]
  //   ],
  //   [
  //   [
  //       {
  //           "sectionNumber": "1",
  //           "days": "Sun Tue",
  //           "hall": "منصة الكترونية",
  //           "seatCount": "500",
  //           "capacity": "22",
  //           "registered": "20",
  //           "instructor": "رشا محمد محسن عبيدات",
  //           "status": "Active",
  //           "teachingType": "by an Electronic Platform",
  //           "startTime": 10,
  //           "endTime": 11.5,
  //           "course": {
  //               "_id": "612e6607a85ea169dbdface2",
  //               "semester": "Second Semester 2020-2021",
  //               "faculty": "Computer & Information Technology",
  //               "department": "Computer Science",
  //               "lineNumber": "1732112",
  //               "symbol": "CS211",
  //               "name": "DATA STRUCTURES",
  //               "creditHours": "3",
  //               "__v": 0
  //           },
  //           "timeObj": {
  //               "start": {},
  //               "end": {}
  //           }
  //       },
  //       {
  //           "sectionNumber": "6",
  //           "days": "Sun Tue",
  //           "hall": "منصة الكترونية",
  //           "seatCount": "500",
  //           "capacity": "25",
  //           "registered": "22",
  //           "instructor": "تسنيم عبد الحميد كامل الملاح",
  //           "status": "Active",
  //           "teachingType": "by an Electronic Platform",
  //           "startTime": 10,
  //           "endTime": 11.5,
  //           "course": {
  //               "_id": "612e6607a85ea169dbdface2",
  //               "semester": "Second Semester 2020-2021",
  //               "faculty": "Computer & Information Technology",
  //               "department": "Computer Science",
  //               "lineNumber": "1732112",
  //               "symbol": "CS211",
  //               "name": "DATA STRUCTURES",
  //               "creditHours": "3",
  //               "__v": 0
  //           },
  //           "timeObj": {
  //               "start": {},
  //               "end": {}
  //           }
  //       }
  //   ]
  //   ],
  //   [
  //     [
  //         {
  //             "sectionNumber": "2",
  //             "days": "Sun Tue",
  //             "hall": "منصة الكترونية",
  //             "seatCount": "500",
  //             "capacity": "26",
  //             "registered": "26",
  //             "instructor": "رشا محمد محسن عبيدات",
  //             "status": "Active",
  //             "teachingType": "by an Electronic Platform",
  //             "startTime": 11.5,
  //             "endTime": 13,
  //             "course": {
  //                 "_id": "612e6607a85ea169dbdface2",
  //                 "semester": "Second Semester 2020-2021",
  //                 "faculty": "Computer & Information Technology",
  //                 "department": "Computer Science",
  //                 "lineNumber": "1732112",
  //                 "symbol": "CS211",
  //                 "name": "DATA STRUCTURES",
  //                 "creditHours": "3",
  //                 "__v": 0
  //             },
  //             "timeObj": {
  //                 "start": {},
  //                 "end": {}
  //             }
  //         },
  //         {
  //             "sectionNumber": "7",
  //             "days": "Sun Tue",
  //             "hall": "منصة الكترونية",
  //             "seatCount": "500",
  //             "capacity": "28",
  //             "registered": "25",
  //             "instructor": "تسنيم عبد الحميد كامل الملاح",
  //             "status": "Active",
  //             "teachingType": "by an Electronic Platform",
  //             "startTime": 11.5,
  //             "endTime": 13,
  //             "course": {
  //                 "_id": "612e6607a85ea169dbdface2",
  //                 "semester": "Second Semester 2020-2021",
  //                 "faculty": "Computer & Information Technology",
  //                 "department": "Computer Science",
  //                 "lineNumber": "1732112",
  //                 "symbol": "CS211",
  //                 "name": "DATA STRUCTURES",
  //                 "creditHours": "3",
  //                 "__v": 0
  //             },
  //             "timeObj": {
  //                 "start": {},
  //                 "end": {}
  //             }
  //         }
  //     ]
  //   ],
  // ];
}
function generateSchedules_Client(sets) {
  console.log("Generate on Client");
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
    if(result.length > 10000)
      result = result.slice(0,10000);
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
//sub-functions for generateSchedules_Client
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

    if (!invalidSchedule) {
      filteredArray.push(list[j]);
    }
    // if schedule is not invalid add it to filteredArray
  }
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
//functions to access options from outside module
function setOptions(days,dayStart,dayEnd){
  options[0] = days;
  options[1] = dayStart;
  options[2] = dayEnd;
}
function getDays(){
  return options[0];
}

export default {
  courses: myCourses,
  _addCourseFunction,
  _removeCourseFunction,
  _searchFunction,
  _generateScheduleFunction,
  setOptions,
  options,
  getDays,
  getUserPinned,
};
