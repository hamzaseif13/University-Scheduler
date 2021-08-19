import app from "./Scheduler.js";
import schedules from "./Generated Schedules.js";
import  {TimeTable} from "./Generated Schedules.js";

class DoubleRange{
  #sliders;
  #values;
  #bar;
  #offsetX;
  #barWidth;
  #colored;
  constructor(elem , min = 0, max = 100,step = 1){
    this.#sliders = elem.querySelectorAll(".rangeSlider");

    this.min = min;
    this.max = max;
    this.step = step;

    this.#values = [min , max];

    this.#bar = elem.querySelector(".bar");
    this.#offsetX = this.#bar.offsetLeft;
    this.#barWidth = this.#bar.clientWidth;
    this.#colored = this.#bar.querySelector(".colored");

    this.#addEvents();
  }
  #addEvents(){
    const self = this;
    for(let i = 0;i<2;i++){
      let dragFlag = false;
      self.#sliders[i].addEventListener("mousedown", function(event){
        event.preventDefault();
        dragFlag = true;
      });
      window.addEventListener("mouseup", function(event){
        dragFlag = false;
      });
      document.body.addEventListener("mousemove", function(event){
        if(dragFlag){
          let pos = event.x - self.#offsetX - 8;
          if(0 < pos && pos < self.#barWidth){
            let oldVal = self.#values[i];
            self.#values[i] = Math.round((pos) / (self.#barWidth) * (self.max - self.min) /self.step)*self.step + self.min;

            if(self.#values[i] == oldVal)
              return;

            if(self.#values[0] >= self.#values[1]){
              // self.#values[i]=oldVal;
              //   return;
              let delta = self.#values[i] - oldVal;
              if(i)
                self.minValue += delta;
              else
                self.maxValue += delta;

              if(self.maxValue === self.minValue){
                self.#values[i] = oldVal;
                return;
              }
            }
            self.#updateSliderPos(i);
            self.onchange();
          }
        }
      });
      window.addEventListener("resize",()=>{
        this.#offsetX = this.#bar.offsetLeft;
        this.#barWidth = this.#bar.clientWidth;
      });
    }
  }
  #updateSliderPos(i){
    this.#sliders[i].style.left ="calc("+ ((this.#values[i] - this.min)  /(this.max - this.min)) * 100 + "% - 8px)";
    this.#colored.style.left =  (this.#values[0] - this.min) / (this.max - this.min) * 100 + "%";
    this.#colored.style.width = (this.#values[1] - this.min) / (this.max - this.min) * 100 - 
                                (this.#values[0] - this.min) / (this.max - this.min) * 100 + "%";
  }
  onchange(){
    for(let i=0;i<2;i++)
      this.#sliders[i].title = this.#values[i];
  }
  get minValue(){
    return this.#values[0];
  }
  get maxValue(){
    return this.#values[1];
  }
  set minValue(val){
    if(val >= this.min && val < this.maxValue){
      this.#values[0] = val;
      this.#updateSliderPos(0);
    }
  }
  set maxValue(val){
    if(val <= this.max && val > this.minValue){
      this.#values[1] = val;
      this.#updateSliderPos(1);
    }
  }
}

const options = {},
  cousresModal = {
    bootstrapModal: undefined,
    body: undefined,
    title: undefined,
    submit: undefined,
    submitFunction: undefined, //this is used to change the function of the submit button (add/remove courses)
    cancel: undefined,
    selected: [], //contains the line numbers of the selected courses in the modal
  },
  table = {
    title: undefined,
    indexInput: undefined,
    next: undefined,
    prev: undefined,
    tableObj: undefined
  },
  sectionModal = {
    body: undefined,
    next: undefined,
    prev: undefined
  },
  covers = {};
let matchedCourses = [];



function updateModal(
  arr,
  title = "Found",
  submitBtn = "Submit",
  highlight = "",
  prop = ""
) {
  cousresModal.title.innerHTML = title + "  " + arr.length + " items";
  cousresModal.submit.innerHTML = submitBtn;
  cousresModal.body.innerHTML = "";
  for (const course of arr) {
    cousresModal.body.appendChild(
      generateHTMLCourseCard(course, highlight, prop)
    );
  }
}
function generateHTMLCourseCard(course, highlight = "", prop = "") {
  let checked = false;

  const copy = { ...course };

  if (highlight != ""){
    highlight = highlight.split(",");
    if (typeof copy[prop] === "string")
      for (const text of highlight) {
        copy[prop] = copy[prop].replace(
          new RegExp(text.trim(), "i"),
          '<span class="bg-warning">' + text + "</span>"
        );
      }
      
  }
  const col = htmlCreator("div", "", "", "col");

  let card = htmlCreator("div", col, "", "card shadow");
  card.style.cursor = "pointer";

  let cardBody = htmlCreator("div", card, "", "card-body");
  htmlCreator("h5", cardBody, "", "card-title", copy.name);

  let listGroup = htmlCreator("ol", card, "", "list-group list-group-flush");
  htmlCreator(
    "li",
    listGroup,
    "",
    "list-group-item",
    '<span class="h6">Faculty:</span> ' + copy.faculty
  );
  htmlCreator(
    "li",
    listGroup,
    "",
    "list-group-item",
    '<span class="h6">Department:</span> ' + copy.department
  );
  htmlCreator(
    "li",
    listGroup,
    "",
    "list-group-item",
    '<span class="h6">Line Number:</span> ' + copy.lineNumber
  );
  htmlCreator(
    "li",
    listGroup,
    "",
    "list-group-item",
    '<span class="h6">Symbol:</span> ' + copy.symbol
  );
  htmlCreator(
    "li",
    listGroup,
    "",
    "list-group-item",
    '<span class="h6">Credit Hours:</span> ' + copy.creditHours
  );

  card.addEventListener("click", function () {
    //event to add course to coursesModal.selected if card is clicked
    checked = !checked;
    if (checked) {
      cousresModal.selected.push(course.lineNumber);
      card.className += " border-success";
    } else {
      let index = cousresModal.selected.findIndex((courseNum) => {
        return courseNum === course.lineNumber;
      });
      if (index != -1) {
        cousresModal.selected.splice(index, 1);
        card.className = card.className.replace(" border-success", "");
      }
    }
  });

  return col;
}
(function getElements() {
    //this code gets the inputs of all options and puts them in #options
    //in this order #options = {option1Name:{input1Name, option1Name, ...}}
    //#options.option1Name.option1Name.innerHTML = "dvz"
    let opt = document.querySelectorAll("#options .option");
    for (const option of opt) {
      let opName = option.title;
      opName = opName.toLowerCase();
      options[opName] = {};

      let inputFields = option.querySelectorAll("input , select");
      for (const input of inputFields) {
        let inputName = input.name;
        if(inputName === "")
          continue;
        inputName = inputName.toLowerCase();
        options[opName][inputName] = input;
      }
      const btn = option.querySelector(".submit")
      if(btn != null)
        options[opName]["submit"] = btn;
    }
    const tRange = document.getElementsByClassName("doubleRange")[0]
    options.time.range = new DoubleRange(tRange,8.5,18.5,0.5);

    let cov = document.querySelectorAll(".cover");
    for (const cover of cov) {
      let opName = cover.title;
      opName = opName.toLowerCase();
      covers[opName] = cover;
    }

    const t = document.getElementById("table");
    table.numOfTables = t.querySelectorAll(".input-group span")[1];
    table.indexInput = t.querySelector(".input-group input")
    table.next = t.querySelector(".next");
    table.prev = t.querySelector(".prev");

    const secModal = document.getElementById("sectionModal");
    sectionModal.body = secModal.querySelector(".modal-body .col-10");
    sectionModal.next = secModal.querySelector(".modal-body .next");
    sectionModal.prev = secModal.querySelector(".modal-body .prev");

    table.tableObj = new TimeTable(t.querySelector(".timeTable"),secModal);

    
    const cModal = document.getElementById("coursesModal");
    cousresModal.body = cModal.querySelector(".modal-body .row");
    cousresModal.title = cModal.querySelector(".modal-title");
    cousresModal.submit = cModal.querySelector(".btn-primary");
    cousresModal.cancel = cModal.querySelector(".btn-secondary");

    cousresModal.bootstrapModal = new bootstrap.Modal(cModal, {keyboard: false});
})();
(function addEvents() {
  
  { //options events
    const submitSearch = function() {
      //function to call when searching (by varius methods like mouse, keyboard)
      if (options["search"].searchval.value.search(/\w.*\w/) == -1) {
        //val has at least 2s alpha-numeric chars
        updateModal([], "Found", "Add Courses"); //to reset modal
        return;
      }
      matchedCourses = app["_searchFunction"](
        options["search"].searchval.value,
        options["search"].searchby.value
      );
      updateModal(
        matchedCourses,
        "Found",
        "Add Courses",
        options["search"].searchval.value,
        options["search"].searchby.value
      );
      cousresModal.submitFunction = function () {
        for (const lineNum of cousresModal.selected) {
          app._addCourseFunction(lineNum);
        }
      };
    };
    options["search"].submit.addEventListener("click", submitSearch);
    options["search"].searchval.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        submitSearch();
        cousresModal.bootstrapModal.show();
      }
    });
    options["courses"].submit.addEventListener("click", function () {
      updateModal(app.courses, "My Courses: ", "Remove Courses");
      cousresModal.submitFunction = function () {
        for (const lineNum of cousresModal.selected) {
          app._removeCourseFunction(lineNum);
        }
      };
    });
    
    let daysString = "all";
    let dayStart = 830;
    let dayEnd = 1830;
    for(const day in options["days"]){
      options.days[day].addEventListener("change", function(){
        daysString = daysString.replace("all","");

        if(this.checked){
          if(!daysString.includes(day))
            daysString += day;
        }
        else
          daysString = daysString.replace(day,"");
        
        if(daysString.length === 0)
          daysString = "all";
        app.setOptions(daysString,dayStart,dayEnd);
      });
    }

    // let timeoutID;
    options["time"].range.onchange = function(){
      // clearTimeout(timeoutID);
      options["time"].min.value = hoursToStr(this.minValue);
      options["time"].max.value = hoursToStr(this.maxValue);

      dayStart = strToIntTime(hoursToStr(this.minValue));
      dayEnd = strToIntTime(hoursToStr(this.maxValue));
      app.setOptions(daysString,dayStart,dayEnd);
      // timeoutID = setTimeout(generate,100);//wait to stop changing for 100ms 
    };
    options["time"].min.addEventListener("change", function(){
      options["time"].range.minValue = strToHours(this.value);

      dayStart = strToIntTime(this.value);
      app.setOptions(daysString,dayStart,dayEnd);
      // generate();
    });
    options["time"].max.addEventListener("change", function(){
      options["time"].range.maxValue = strToHours(this.value);

      dayEnd = strToIntTime(this.value);
      app.setOptions(daysString,dayStart,dayEnd);
      // generate();
    });
  }

  { //table events
    options["generateschedule"].submit.addEventListener("click",()=>{
      schedules.generate(true);
    });

    table.indexInput.addEventListener("change", function(){
      let val = parseInt(this.value);
      
      this.value = schedules.changeActiveSchedule(val);

      schedules.displaySchedule();
    });
    table.next.addEventListener("click", function(){
      schedules.next();
      schedules.displaySchedule();
    });
    table.prev.addEventListener("click", function(){
      schedules.prev();
      schedules.displaySchedule();
    });
  }

  sectionModal.next.addEventListener("click", function(){
    const t = table.tableObj;
    t.changeActiveSec("",t.activeGroup.activeSecIndex + 1);
    t.displaySectionDetails();
  });
  sectionModal.prev.addEventListener("click", function(){
    const t = table.tableObj;
    t.changeActiveSec("",t.activeGroup.activeSecIndex - 1);
    t.displaySectionDetails();
  });

  cousresModal.submit.addEventListener("click", function () {
    cousresModal.submitFunction();
    cousresModal.bootstrapModal.hide();
    cousresModal.selected = [];
  });
  document.body.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      cousresModal.bootstrapModal.hide();
    }
  });
  
})();


function htmlCreator(tag, parent, id = "", clss = "", inHTML = "") {
  let t = document.createElement(tag);
  if (parent != "") parent.appendChild(t);
  t.id = id;
  t.className = clss;
  t.innerHTML = inHTML;

  return t;
}
function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function hoursToStr(h){
  let m = h - Math.floor(h);
  h -= m;
  m *= 60;
  if(m==0)m="00";
  return h + ":" + m;
}
function strToHours(str){
  const t = str.split(":");
  let h = parseInt(t[0]);
  let m = parseInt(t[1]);
  h += m/60;
  return h;
}
function strToIntTime(str){
  return parseInt(str.replace(":",""));
}

const ct = covers.table;

export {table,htmlCreator, ct as tableCover};