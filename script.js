
class Database{
  #courses;
  constructor(){
    this.#courses = [];

    this.#dataExtractor();
  }
  #addCourse(c){
    this.#courses.push(c);
  }
  #dataExtractor(){
      const arabicLetter = "[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]";
      for(let i=0,l=HTMLData.length;i<l;i++){
        let tmp , arr, facultyName, departmentName;
        tmp = HTMLData.shift().replace(new RegExp(`(?<=\\w|${arabicLetter}) (?=\\w|${arabicLetter})`,"gm"),"@@");//mark spaces between words
        tmp = tmp.replace(/\s+/gm,""); //remove extra spaces
        tmp = tmp.replace(/@@/g," ");//return spaces between words
        tmp = tmp.replace(/selected="selected"/igm,">@@@<");//mark selected semester,faculty,department,view
        tmp = tmp.replace(/<.*?>/gm,"."); //replace all html tags with dots
        tmp = tmp.replace(/[.]+/mg,"|"); //replace multi (.) with |
        tmp = tmp.replace(/:/mg,"").replace(/&amp;/g," & "); //remove [:] and add [&]

        arr = [...tmp.matchAll(/(?<=@@@[|]).*?(?=[|])/gm)];
        facultyName = arr[1][0];
        departmentName = arr[2][0];

        tmp = tmp.replace(/.*?line number/i,"Line Number"); //remove everything before the first course(Line number)

        arr = tmp.split(/(?=line number)/i); //split every course alone
        arr = arr.map((s)=>{return s.split("|")}); //split data for every course
        
        
        for(const course of arr){
          const courseData = [],c = new Course();

          for (let i = 0; i < 4; i++) {
            course.shift();
            courseData.push(course.shift());
          }
          c.set(facultyName,departmentName,...courseData);

          course.splice(0,10);//remove table heads

          while(course.length >= 10){
            const sectionData = [] , s = new Section();
            for(let i = 0; i < 10; i++){
              sectionData.push(course.shift()); 
            }
            s.set(...sectionData);
            c.addSection(s);
          }
          this.#addCourse(c);
        }
      }
  }
  search(val,searchBy = "lineNumber"){ //returns an array with all matches
    if(!(new Course()).hasOwnProperty(searchBy)){
      // throw Error("err");
      return;
    }
    return this.#courses.filter((course)=>{
      return course[searchBy] == val;
    });
  }
}
//processed data from HTMLData var from data.js file

class Scheduler{
  #database;
  #courses;
  constructor(){
        this.#database = new Database();
        this.#courses = [];
  }
  _search(val , searchBy){
    return this.#database.getCourses(val , searchBy); 
  }
}

class SchedulerGUI{
  #app;
  #options;
  #table;
  constructor(){
        this.#options = {};
        this.#table = [];

        this.#getElements();

        this.#app = new Scheduler();
  }
  #getElements(){
        //this code gets the inputs of all options and puts them in #options
        //in this order #options = {option1Name:{input1Name, option1Name, ...}}
        //#options.option1Name.option1Name.innerHTML = "dvz"
        let options = document.querySelectorAll("#options .option");
        for(const option of options){ 
            let opName = option.title;
            opName = opName.toLowerCase();
            this.#options[opName] = {};

            let inputFields = option.querySelectorAll("input");
            for(const input of inputFields){
                let inputName = input.name;
                inputName = inputName.toLowerCase();
                this.#options[opName][inputName] = input;
            }
            this.#options[opName]["submit"] = option.querySelector(".submit");

        }

        const tableRows = document.querySelectorAll("#table tbody tr");
        for(const row of tableRows){
          let cells = row.querySelectorAll("td");
          cells = Array.from(cells);
          cells.shift(); //remove hour cell
          this.#table.push(cells);
        }

  }
}


class Course {
  constructor() {
    this.faculty = "";
    this.department = "";
    this.lineNumber = "";
    this.symbol = "";
    this.name = "";
    this.creditHours = "";
    this.sections = [];
  }
  set(faculty,department,lineNumber, symbol,name,creditHours){//order is important (same order of html)
    this.faculty = faculty;
    this.department = department;
    this.lineNumber = lineNumber;
    this.symbol = symbol;
    this.name = name;
    this.creditHours = creditHours;
  }
  addSection(sec){
    // if(typeof sec != Section)
    //   throw new Error("incorrect var type");
    // else
      this.sections.push(sec)
  }
  getSection(val,searchBy = "sectionNumber"){
    return this.sections.find((sec)=>{
      return sec[searchBy] == val;
    });
  }
}
class Section {
  constructor() {
    this.sectionNumber = "";
    this.days = "";
    this.time = "";
    this.hall = "";
    this.seatCount = "";
    this.capacity = "";
    this.registered = "";
    this.instructor = "";
    this.status = "";
    this.teachingType = "";
  }
  set(sectionNumber, days, time, hall, seatCount, capacity, registered, instructor, status, teachingType) {//order is important (same order of html)
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
}



/*
var Se230 = new Section("FUNDAMENTALS OF SOFTWARE ENGINEERING",1762300,3,1,"Sun Mon Tue Wed","10:00-11:30","online", 35, 35,"خلدون طارق احمد الزعبي	"
);

var Se230 = new Section("FUNDAMENTALS OF SOFTWARE ENGINEERING",1762300,3,1,"Sun Mon Tue Wed","10:00-11:30","online", 35, 35,"خلدون طارق احمد الزعبي	");

var courseTable = document.getElementById("tb")
courseTable.className="table table-hover"
courseTable.innerHTML = `<tr>
<td>Credit Hours</td>
<td>Department</td>
<td>Name</td>
<td>Line number</td>
<td>Section</td>
<td>Days</td>
<td>Time</td>
<td>Hall</td>
<td>Capacity</td>
<td>Registred</td>
<td>Instructor</td>
</tr>
<tr>
<td>${Se230.department}</td>
<td>${Se230.creditHours}</td>
<td>${Se230.name}</td>
<td>${Se230.lineNumber}</td>
<td>${Se230.sectionNumber}</td>
<td>${Se230.days}</td>
<td>${Se230.time}</td>
<td>${Se230.hall}</td>
<td>${Se230.capacity}</td>
<td>${Se230.registered}</td>
<td>${Se230.instructor}</td>
</tr>`;
document.getElementById("table").appendChild(courseTable);*/
