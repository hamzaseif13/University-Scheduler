const HTMLData=require('./data.js');

class Time{
  #totalMinutes;
  constructor(min = 0){
    this.#totalMinutes = min;
  }
  setTime(t){
    if(typeof t === "number"){
      t = toString(t);
    }
    if(typeof t === "string"){
      let PMFlag = false;
      t = t.toLowerCase();
      let m , h;
      
      if(t.includes("am")){
        t = t.replace("am" ,"");
      }
      else if(t.includes("pm")){
        PMFlag = true;
        t = t.replace("pm" ,"");
      }

      if(t.includes(":")){
        t = t.split(":");
        h = t[0];
        m = t[1];
      }
      else{
        if(t.length == 4 || t.length == 3){
          h = t.slice(0 , -2)
          m = t.slice(-2);
        }
        else{
          h = t;
          m = 0;
        }
        
      }
      h = parseInt(h);
      m = parseInt(m);
      if(PMFlag && h != 12) h+=12;

      this.#totalMinutes = h * 60 + m;
    }
    else{
      console.error("invalid time format");
      return false;
    }
    if(this.isOutOfBound()){
      console.warn("Time Out of Bound. time must be less than 24 hours and more than 0");
      // return false;
    }
    return true;
  }
  set totalMinutes(m){
    if(typeof m === "number")
      this.#totalMinutes = m;
  }
  set totalHours(h){
    this.#totalMinutes = h * 60;
  }

  get totalMinutes(){
    return this.#totalMinutes;
  }
  get totalHours(){
    return this.#totalMinutes / 60;
  }
  get string24(){
    if(this.isOutOfBound()) return "Time Out of Bound";

    let h = Math.floor(this.totalHours);
    let m = Math.round((this.totalHours - h) * 60);
    
    if(m < 10) m = "0" + m;
    
    return h + ":" + m;
  }
  get string12(){
    if(this.isOutOfBound()) return "Time Out of Bound";
    
    let am_pm = "AM";

    let h = Math.floor(this.totalHours);
    let m = Math.round((this.totalHours - h) * 60);

    if(h >= 12){
      if(h != 24) am_pm = "PM"; //24 => 12am (midnight)
      if(h != 12) h -= 12; //12pm (midday)
    }
    if(m < 10) m = "0" + m;

    return h + ":" + m + am_pm;
  }
  isOutOfBound(startHour = 0, endHour = 24){
    return (this.#totalMinutes > endHour*60 || this.#totalMinutes < startHour*60);
  }
  isValid(){
    return typeof this.#totalMinutes === "number" && !isNaN(this.#totalMinutes);
  }

  increaseBy(t){
    if(!(tObj instanceof Time)){
      const val = tObj;
      tObj = new Time();
      tObj.setTime(val);
    }

    this.#totalMinutes += t.totalMinutes;
  }
  decreaseBy(t){
    if(!(tObj instanceof Time)){
      const val = tObj;
      tObj = new Time();
      tObj.setTime(val);
    }

    this.#totalMinutes -= t.totalMinutes;
  }

  static isValid(value){
    if(!(value instanceof Time)){
      const val = value;
      value = new Time();
      value.setTime(val);
    }
    return value.isValid();
  }
  static isOutOfBound(value, startHour = 0, endHour = 24){
    if(!(value instanceof Time)){
      const val = value;
      value = new Time();
      value.setTime(val);
    }
    return value.isOutOfBound(startHour, endHour);
  }
  static add(...tArr){
    let sum = 0;

    for (let tObj of tArr) {
      if(!(tObj instanceof Time)){
        const val = tObj;
        tObj = new Time();
        tObj.setTime(val);
      }
      sum += t.totalMinutes;
    }
    return new Time(sum);
  }
  static subtract(t1, t2){
    if(!(t1 instanceof Time)){
      const val = tObj;
      t1 = new Time();
      t1.setTime(val);
    }
    
    if(!(t2 instanceof Time)){
      const val = tObj;
      t2 = new Time();
      t2.setTime(val);
    }

    return new Time(t1.totalMinutes - t2.totalMinutes);
  }
}

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
        start: new Time(),
        end: new Time(),
        delta(){return Time.subtract(this.end , this.start);},
        string: function () {
          return (
            this.start.string12 +
            " - " +
            this.end.string12
          );
        },
      };
     
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
      if(val == "حسب القسم")
        return;

      let arr = val.split("**");
      if(parseInt(arr[0]) < 700) arr[0] += "pm";
      if(parseInt(arr[1]) < 700) arr[1] += "pm";

      this.timeObj.start.setTime(arr[0]);
      this.timeObj.end.setTime(arr[1]);

      this.startTime = this.timeObj.start.totalHours;
      this.endTime = this.timeObj.end.totalHours;
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

//   let search=await Course.find({symbol:{$regex:new RegExp(`^`+payload+".*","i")}}).exec();

module.exports ={search,advancedSearch, filterHTML, Time};