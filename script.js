const database = [];//processed data from HTMLData var from data.js file

class Scheduler{

}

class SchedulerGUI{
    #app;
    #options;
    constructor(){
        console.log(dataParser());
        this.#options = {};

        this.#getElements();
    }
    #getElements(){
        //this code gets the inputs of all options and puts them in #options
        //in this order #options = {option1Name:{input1Name, input2Name, ...}}
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

class Course {
  constructor(Name, LineNumber,CreditHours,Department) {
    this.creditHours=CreditHours;
    this.name = Name;
    this.lineNumber = LineNumber;
    this.department=Department;
  }
}

class Section extends Course {
  constructor(Name,LineNumber,CreditHours,Department,sNumber, Days,Time,Hall, Capacity, Registered, Instructor ) {
    super(Name, LineNumber,CreditHours,Department);

    this.sectionNumber = sNumber;
    this.days = Days;
    this.time = Time;
    this.hall = Hall;
    this.capacity = Capacity;
    this.registered = Registered;
    this.instructor = Instructor;
  }
}

function dataParser(){
    let tmp , arr;
    tmp = HTMLData.replace(/\s+/gm,""); //remove spaces
    tmp = tmp.replace(/<.*?>/gm,"."); //replace all html tags with dots
    tmp = tmp.replace(/.*?linenumber/i,"LineNumber"); //remove everything before the first course(Line number)
    tmp = tmp.replace(/[.]+/mg,"|"); //replace multi (.) with |
    
    arr = tmp.split(/linenumber/i); //split every course alone
    arr = arr.map((s)=>{return s.split("|")}); //split data for every course
    
    arr.shift(); //remove first element becsuse it is empty (when splitting the first element is empty)

    return arr;
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
document.getElementById("table").appendChild(courseTable);
