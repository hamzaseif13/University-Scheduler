
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
  _searchFunction(val , searchBy){
    const result = this.#database.search(val , searchBy);
    const cards = [];
    for (const course of result) {
      cards.push(course.generateHTMLcard());
    }
    return cards;
  }
}

class SchedulerGUI{
  #app;
  #options;
  #table;
  #myModal;
  constructor(){
        this.#options = {};
        this.#table = [];

        this.#myModal = {
          body:undefined,
          title:undefined,
          submit:undefined,
          cancel:undefined,
          children: []
        };

        this.#getElements();

        this.#app = new Scheduler();

        this.#addEvents();
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

            let inputFields = option.querySelectorAll("input , select");
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

        const modal = document.getElementById("myModal");
        this.#myModal.body = modal.querySelector(".modal-body .row");
        this.#myModal.title = modal.querySelector(".modal-title");
        this.#myModal.submit = modal.querySelector(".btn-primary");
        this.#myModal.cancel = modal.querySelector(".btn-secondary");
  }
  #addEvents(){
    const self = this;

    const op = self.#options["search"];
    op.submit.addEventListener("click",function(){
      self.#myModal.children = self.#app["_searchFunction"](op.searchval.value,op.searchby.value);
      self.updateModal();
    });
  }
  updateModal(title = "Found"){
    this.#myModal.title.innerHTML = title + "  " + this.#myModal.children.length + " items"
    this.#myModal.body.innerHTML = "";
    for (const child of this.#myModal.children) {
      this.#myModal.body.appendChild(child);
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
  generateHTMLcard(){
    const col = htmlCreator("div", "", "", "col");
    let card = htmlCreator("div", col, "", "card");
    
    let cardBody = htmlCreator("div", card, "", "card-body");
    htmlCreator("h5", cardBody, "", "card-title", this.name);
    
    let listGroup = htmlCreator("ol", card, "", "list-group list-group-flush");
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Faculty:</span> "+this.faculty);
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Department:</span> "+this.department);
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Line Number:</span> "+this.lineNumber);
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Symbol:</span> "+this.symbol);
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Credit Hours:</span> "+this.creditHours);

    let cardFooter = htmlCreator("div", card, "", "card-footer text-center");
    let checkbox = htmlCreator("input", cardFooter, "", "form-check-input ml-5");
    checkbox.type = "checkbox";

    return col;
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


function htmlCreator(tag,parent,id="",clss="",inHTML=""){
  let t = document.createElement(tag);
  if(parent != "")
    parent.appendChild(t);
  t.id = id;
  t.className = clss;
  t.innerHTML = inHTML;

  return t;
}


