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
            s.set(c.name,...sectionData);
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
      let original = course[searchBy];

      original = original.toLowerCase();
      original = original.trim();

      if(typeof val === "number")
        val.toString();
      val = val.toLowerCase();
      val = val.trim();
      
      return  original.includes(val);
    }).map((course)=>{ //change returned array items from original courses (from database) to copies
      return {...course};
    });
  }
}
//processed data from HTMLData var from data.js file

class Scheduler{
  #database;
  #myCourses;
  #schedule;
  constructor(){
        this.#database = new Database();
        this.#myCourses = [];
        this.#schedule=[];
  }
  get courses(){// getter to access #myCourses from outside the class
    return this.#myCourses;
  }
  courseIndex(courseNum){//function to search the index of a course inside #myCourses
    return this.#myCourses.findIndex((item)=>{
      return item.lineNumber === courseNum;
    });
  }
  _searchFunction(val , searchBy){
    const result = this.#database.search(val , searchBy);
    return result;
  }
  _addCourseFunction(courseNum){
    if(this.courseIndex(courseNum) != -1)//check if the course already exist
      return;
      
    const course = this.#database.search(courseNum);
    this.#myCourses.push(...course);
  }
  _removeCourseFunction(courseNum){
    let index = this.courseIndex(courseNum);

    if(index != -1)
      this.#myCourses.splice(index, 1);
  }
  _generateScheduleFunction(){
    for(let y=0;y<this.#myCourses.length;y++){
      console.log(this.#myCourses[y].sections[0])
    }
    
  }
}

class SchedulerGUI{
  #app;
  #options;
  #tableCols;
  #myModal;
  #matchedCourses;
  constructor(){
        this.#options = {};
        this.#tableCols = [];
        this.#matchedCourses = [];

        this.#myModal = {
          bootstrapModal: undefined,
          body:undefined,
          title:undefined,
          submit:undefined,
          submitFunction: undefined, //this is used to change the function of the submit button (add/remove courses)
          cancel:undefined,
          selected: [] //contains the line numbers of the selected courses in the modal
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

        this.#tableCols = document.querySelectorAll("#table .schedule .tableCol") ;
        for (const col of this.#tableCols) {
          col.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' "+
          "width='"+ col.offsetHeight * 0.09 /2 +"' height='"+ col.offsetHeight * 0.09 /2 +
          "' viewBox='0 0 100 100'%3E%3Cg stroke='%23000000' stroke-width='1' "+
          "%3E%3Crect fill='%23e9e9e9' x='-60' y='-60' width='240' height='60'/%3E%3C/g%3E%3C/svg%3E\")";
        }
        /**
         url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' 
         width='337' height='337' viewBox='0 0 100 100'%3E%3Cg stroke='%23000000' stroke-width='1.8' 
         %3E%3Crect fill='%23F5F5F5' x='-60' y='-60' width='240' height='60'/%3E%3C/g%3E%3C/svg%3E")
         */

        const modal = document.getElementById("myModal");
        this.#myModal.body = modal.querySelector(".modal-body .row");
        this.#myModal.title = modal.querySelector(".modal-title");
        this.#myModal.submit = modal.querySelector(".btn-primary");
        this.#myModal.cancel = modal.querySelector(".btn-secondary");
        
        this.#myModal.bootstrapModal = new bootstrap.Modal(modal, {
          keyboard: false
        });
  }
  #addEvents(){
    const self = this;
   
    const op = self.#options["search"];
    const generateButton=document.getElementById("generate") //i couldnt access the generate button from options so i 
    //this u can fix it if u want 
    generateButton.addEventListener("click",()=>{//when generate button clicked it will call the fucntion _generateSchedule
      self.#app._generateScheduleFunction();
    })

    const submitSearch = function(){ //function to call when searching (by varius methods like mouse, keyboard)
       if(op.searchval.value.search(/\w.*\w/) == -1){//val has at least 2s alpha-numeric chars
         self.updateModal([],"Found", "Add Courses");//to reset modal
         return;
       }
       self.#matchedCourses = self.#app["_searchFunction"](op.searchval.value,op.searchby.value);
       self.updateModal(self.#matchedCourses,"Found", "Add Courses", op.searchval.value, op.searchby.value);
       self.#myModal.submitFunction = function(){
         for(const lineNum of self.#myModal.selected){
           self.#app._addCourseFunction(lineNum);
         }
       }
     };
    op.submit.addEventListener("click", submitSearch);
    op.searchval.addEventListener("keydown", function(event){
      if(event.key === "Enter"){
        submitSearch();
        self.#myModal.bootstrapModal.show();
      }
    });

    self.#options["courses"].submit.addEventListener("click", function(){
      self.updateModal(self.#app.courses,"My Courses: ", "Remove Courses");
      self.#myModal.submitFunction = function(){
        for(const lineNum of self.#myModal.selected){
          self.#app._removeCourseFunction(lineNum);
        }
      }
    });

    self.#myModal.submit.addEventListener("click", function(){
      self.#myModal.submitFunction();
      self.#myModal.bootstrapModal.hide();
      self.#myModal.selected = [];
    });
  }
  updateModal(arr,title = "Found", submitBtn = "Submit", highlight = "", prop = ""){
    this.#myModal.title.innerHTML = title + "  " + arr.length + " items";
    this.#myModal.submit.innerHTML = submitBtn;
    this.#myModal.body.innerHTML = "";
    for (const course of arr) {
      this.#myModal.body.appendChild(this.#generateCourseCard(course , highlight, prop));
    }
  }
  #generateCourseCard(course , highlight = "", prop = ""){
    const self = this;
    const copy = {...course};
    if(highlight != "")
      if(typeof copy[prop] === "string")
        copy[prop] = copy[prop].replace(new RegExp(highlight.trim(),"i"),"<span class=\"bg-warning\">" + highlight + "</span>");
    const col = htmlCreator("div", "", "", "col");
    let card = htmlCreator("div", col, "", "card");
    
    let cardBody = htmlCreator("div", card, "", "card-body");
    htmlCreator("h5", cardBody, "", "card-title", copy.name);
    
    let listGroup = htmlCreator("ol", card, "", "list-group list-group-flush");
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Faculty:</span> "+copy.faculty);
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Department:</span> "+copy.department);
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Line Number:</span> "+copy.lineNumber);
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Symbol:</span> "+copy.symbol);
    htmlCreator("li", listGroup, "", "list-group-item", "<span class=\"h6\">Credit Hours:</span> "+copy.creditHours);

    let cardFooter = htmlCreator("div", card, "", "card-footer text-center");
    let checkbox = htmlCreator("input", cardFooter, "", "form-check-input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function(){//event to add course to #myModal.selected if checkbox is checked
      if(this.checked)
        self.#myModal.selected.push(course.lineNumber);
      else{
        let index = self.#myModal.selected.findIndex((courseNum)=>{
          return courseNum === course.lineNumber;
        });
        if(index != -1)
          self.#myModal.selected.splice(index, 1);
      }
    });

    return col;
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
    this.courseName = "";
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
  }
  set(courseName, sectionNumber, days, time, hall, seatCount, capacity, registered, instructor, status, teachingType) {//order is important (same order of html)
    this.courseName = courseName;
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
  set time(val){
    let arr = val.split("**");
    arr = arr.map((val)=>{
      val = parseInt(val , 10);
      if(val < 800)//if time < 8:00 then it is PM so add 12 hours to convert to 24 Hours
        val += 1200;

      return val;
    })//.sort((a, b)=> a - b);
    this.startTime = arr[0];
    this.endTime = arr[1];
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