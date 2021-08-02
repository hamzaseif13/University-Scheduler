const database = {};//processed data from HTMLData var from data.js file
//database = {faculty1:{department1:{course1:{section1,section2}}}}
//all data is without spaces
class Scheduler{
  constructor(){

  }
}

class SchedulerGUI{
  #app;
  #options;
  constructor(){
        dataParser();
        this.#options = {};

        this.#getElements();
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
  }
}


class Faculty{
  constructor(){
    this.name;
    this.departments = [];
  }
  addDepartment(d){
    if(typeof d != Department)
      throw new Error("incorrect var type");
    else
      this.departments.push(sec)
  }
}
class Department{
  constructor(name = ""){
    this.name = name;
    this.courses = [];
  }
  addCourse(c){
    // if(typeof c != Course)
    //   throw new Error("incorrect var type");
    // else
      this.courses.push(c)
  }
}
class Course {
  constructor() {
    this.lineNumber;
    this.symbol;
    this.name;
    this.creditHours;
    this.sections = [];
  }
  set(lineNumber, symbol,name,creditHours){
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
}
class Section {
  constructor() {
    this.sectionNumber;
    this.days;
    this.time;
    this.hall;
    this.seatCount;
    this.capacity;
    this.registered;
    this.instructor;
    this.status;
    this.teachingType;
  }
  set(sectionNumber, days, time, hall, seatCount, capacity, registered, instructor, status, teachingType) {
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

function dataParser(){
    let tmp , arr;
    tmp = HTMLData.replace(/\s+/gm,""); //remove spaces
    tmp = tmp.replace(/<.*?>/gm,"."); //replace all html tags with dots
    tmp = tmp.replace(/.*?linenumber/i,"LineNumber"); //remove everything before the first course(Line number)
    tmp = tmp.replace(/[.]+/mg,"|"); //replace multi (.) with |
    tmp = tmp.replace(/:/mg,"");
    
    arr = tmp.split(/linenumber/i); //split every course alone
    arr = arr.map((s)=>{return s.split("|")}); //split data for every course
    
    arr.shift(); //remove first element becsuse it is empty (when splitting the first element is empty)

    const d = new Department("Computer Science");
    for(const course of arr){
      const courseData = [],c = new Course();

      for (let i = 0; i < 4; i++) {
        course.shift();
        courseData.push(course.shift());
      }
      c.set(...courseData);

      course.splice(0,10);

      while(course.length >= 10){
        const sectionData = [] , s = new Section();
        for(let i = 0; i < 10; i++){
          sectionData.push(course.shift()); 
        }
        s.set(...sectionData);
        c.addSection(s);
      }
      d.addCourse(c);
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
