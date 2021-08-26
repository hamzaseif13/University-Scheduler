import HTMLData from "./data.js";

class Course {
    constructor() {
      this.semester = "";
      this.faculty = "";
      this.department = "";
      this.lineNumber = "";
      this.symbol = "";
      this.name = "";
      this.creditHours = "";
      this.sections = [];
    }
    set(semester, faculty, department, lineNumber, symbol, name, creditHours) {
      //order is important (same order of html)
      this.semester = semester;
      this.faculty = faculty;
      this.department = department;
      this.lineNumber = lineNumber;
      this.symbol = symbol;
      this.name = name;
      this.creditHours = creditHours;
    }
    addSection(sec) {
      // if(typeof sec != Section)
      //   throw new Error("incorrect var type");
      // else
      this.sections.push(sec);
      sec.course = this; //a pointer to the course of the section
    }
    getSection(val, searchBy = "sectionNumber") {
      return this.sections.find((sec) => {
        return sec[searchBy] == val;
      });
    }
}
class Section {
    constructor() {
      this.sectionNumber = "";
      this.days = "";
      this.hall = "";
      this.seatCount = "";
      this.capacity = "";
      this.registered = "";
      this.instructor = "";
      this.status = "";
      this.teachingType = "";
      this.startTime = undefined;
      this.endTime = undefined;
      this.timeObj = {
        start: {
          h: 0,
          m: 0,
        },
        end: {
          h: 0,
          m: 0,
        },
        deltaH: function () {
          return (this.end.h - this.start.h + 12) % 12;
        }, //if less than 0 add 12
        deltaM: function () {
          return this.end.m - this.start.m;
        },
        deltaT: function () {
          return this.deltaH() + this.deltaM() / 60;
        },
        string: function () {
          return (
            this.start.h +
            ":" +
            this.start.m +
            " - " +
            this.end.h +
            ":" +
            this.end.m
          );
        },
      };
      this.course = {}; //a pointer to the course of the section
    }
    set(
      sectionNumber,
      days,
      time,
      hall,
      seatCount,
      capacity,
      registered,
      instructor,
      status,
      teachingType
    ) {
      //order is important (same order of html)
      this.sectionNumber = sectionNumber;
      this.days = days;
      this.time = time;
      this.hall = hall;
      this.seatCount = seatCount;
      this.capacity = capacity;
      this.registered = registered;
      this.instructor = instructor;
      this.status = status;
      this.teachingType = teachingType;
    }
    set time(val) {
      let arr = val.split("**");
      arr = arr.map((val) => {
        val = parseInt(val, 10);
        if (val < 800)
          //if time < 8:00 then it is PM so add 12 hours to convert to 24 Hours
          val += 1200;
  
        return val;
      }); //.sort((a, b)=> a - b);
      this.startTime = arr[0];
      this.endTime = arr[1];
  
      let tsH = Math.floor(this.startTime / 100);
      tsH = tsH > 12 ? tsH - 12 : tsH;
      let tsM = this.startTime % 100 == 0 ? "00" : this.startTime % 100;
  
      this.timeObj.start.h = tsH;
      this.timeObj.start.m = tsM;
  
      let teH = Math.floor(this.endTime / 100);
      teH = teH > 12 ? teH - 12 : teH;
      let teM = this.endTime % 100 == 0 ? "00" : this.endTime % 100;
  
      this.timeObj.end.h = teH;
      this.timeObj.end.m = teM;
    }
}

const courses = [];

function addCourse(c) {
    courses.push(c);
}

function search(val, searchBy = "lineNumber") {
    //returns an array with all matches
    if (!new Course().hasOwnProperty(searchBy)) {
      // throw Error("err");
      return;
    }
    return advancedSearch("",false,[val,searchBy]);
}

function advancedSearch(arr,strict,...conditions){
  // strict:(true/false) ,condition => {val:"val" , searchBy: "searchBy" , op:("and"/"or"),not:(true/false)} /OR/ ["val","searchBy","and/or",not(true/false)]
  // in strict = true => (cond.val === course[prop])
  //in strict = false => val(string/RegExp) if val(string) => case-insensetive , spaces are trimmed from the start and end
  if(!Array.isArray(arr))
    arr = courses;
  if(arr.length == 0)
    return [];
  let dataArr = arr;
  let sectionFlag = false;
  for(let i=0,l=conditions.length;i<l;i++){
    if(Array.isArray(conditions[i])){//if condition items are arrays change them to objects
      conditions[i] = {val:conditions[i][0],searchBy:conditions[i][1],op:conditions[i][2],not:conditions[i][3]};
    }
    if (!new Course().hasOwnProperty(conditions[i].searchBy)) {//check if cond.searchBy is a property of Course / Section classes
      if (!new Section().hasOwnProperty(conditions[i].searchBy)){
        console.error(conditions[i].searchBy + " is not a property of Course or Section classes")
        return [];
      }
      sectionFlag = true;
      if(!Array.isArray(arr[0].sections))//check if array contains courses or sections
        continue;
      dataArr = [];
      for(const item of arr){// if searchBy is a property of Section class change search dataArr from array of Courses to array of Sections
        dataArr.push(...item.sections);
      }
    }
  }
  function compare(cond,obj){
    if(strict)
      return (obj[cond.searchBy] === cond.val);
    
    let original = obj[cond.searchBy];

    if (typeof cond.val === "number")cond.val = cond.val.toString();

    if(!(cond.val instanceof RegExp)){
      original = original.toLowerCase();
      original = original.trim();
      
      cond.val = cond.val.toLowerCase();
      cond.val = cond.val.trim();
    }
    
    return original.search(cond.val) != -1;
  }
  let result = dataArr.filter((item)=>{
    let res;
    for (let i=0,l=conditions.length;i<l;i++) {
      const cond = conditions[i];
      if(sectionFlag && (new Course().hasOwnProperty(cond.searchBy)))
        item = item.course;
      
      let comp = compare(cond, item);
      if(cond.not)
        comp = !comp;
      
      if(i === 0)
        res = comp;
      else if(cond.op === "and")
        res = res && comp;
      else if(cond.op === "or")
        res = res || comp;
    }
    return res;
  }).map((item) => {
    //change returned array items from original courses (from database) to copies
    return { ...item };
  });
  return result;
} 

function filterHTML(html){
  if(html.search(/semester/igm) < 20){//check if input is filtered
      html = html.replace(/\n/gm, ""); //remove spaces
      return html;
    }
  const arabicLetter =
    "[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]";
  let tmp, arr, semester, facultyName, departmentName;
    tmp = html.replace(
      new RegExp(`(?<=\\w|${arabicLetter}) (?=\\w|${arabicLetter})`, "gm"),
      "@@"
    ); //mark spaces between words
  tmp = tmp.replace(/\s+/gm, ""); //remove extra spaces
  tmp = tmp.replace(/@@/g, " "); //return spaces between words
  tmp = tmp.replace(/selected="selected"/gim, ">@@@<"); //mark selected semester,faculty,department,view
  tmp = tmp.replace(/<br.?>/gm, "@");//mark breaks inside table
  tmp = tmp.replace(/<.*?>/gm, "~"); //replace all html tags with [~]
  tmp = tmp.replace(/[~]+/gm, "|"); //replace multi [~] with |
  tmp = tmp.replace(/:/gm, "").replace(/&amp;/g, " & "); //remove [:] and add [&]
    
  arr = [...tmp.matchAll(/(?<=@@@[|]).*?(?=[|])/gm)];
  semester = arr[0][0];
  facultyName = arr[1][0];
  departmentName = arr[2][0];

  tmp = tmp.replace(/@[|]|[|]@/gm,"|");//remove unwanted [@] in the start and end of the data item
  tmp = tmp.replace(/.*?line number/i, "Line Number"); //remove everything before the first course(Line number)

  tmp = semester+"|"+facultyName+"|"+departmentName+"|"+tmp;

  return tmp;
}

(function dataExtractor() {
    for (let i = 0, l = HTMLData.length; i < l; i++) {
      let tmp = filterHTML(HTMLData.shift());
      
      let arr = tmp.split(/(?=line number)/i); //split every course alone
      arr = arr.map((s) => {
        return s.split("|");
      }); //split data for every course

      const semester = arr[0][0];
      const facultyName = arr[0][1];
      const departmentName = arr[0][2];

      arr.shift();

      for (const course of arr) {
        const courseData = [],
          c = new Course();

        for (let i = 0; i < 4; i++) {
          course.shift();
          courseData.push(course.shift());
        }
        c.set(semester, facultyName, departmentName, ...courseData);

        course.splice(0, 10); //remove table heads

        while (course.length >= 10) {
          const sectionData = [],
            s = new Section();
          for (let i = 0; i < 10; i++) {
            let data = course.shift();
            if(data.includes("@")){
              let arr = data.split("@");
              data = arr.shift();
              // if(arr[0]!="منصة الكترونية")
              //   console.log(departmentName)
            }
            sectionData.push(data);
          }
          s.set(...sectionData);
          c.addSection(s);
        }
        addCourse(c);
      }
    }
})();
// let arr = advancedSearch("",false,[/thu/i,"days","and",true]);
// console.table(arr.length);
// arr = advancedSearch(arr,false,[/thu/i,"days"])
// console.table(arr.length);

export default search;
export {advancedSearch, filterHTML};