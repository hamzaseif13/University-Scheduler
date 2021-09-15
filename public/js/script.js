import app from "./generator.js";
import schedulesControls from "./Generated Schedules.js";
import  {ScheduleGroup} from "./Generated Schedules.js";
import {Time} from "./Database.js";


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
    this.#offsetX = this.#bar.getBoundingClientRect().left;
    this.#barWidth = this.#bar.clientWidth;
    this.#colored = this.#bar.querySelector(".colored");

    this.#addEvents();
  }
  #addEvents(){
    const self = this;
    for(let i = 0;i<2;i++){
      let dragFlag = false;
      function start(event){
          event.preventDefault();
          dragFlag = true;
      }
      function end(){
          dragFlag = false;
      }
      function move(event){
          if(dragFlag){
            let pos = event.clientX - self.#offsetX;
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
      }
      self.#sliders[i].addEventListener("mousedown", start);
      window.addEventListener("mouseup", end);
      document.body.addEventListener("mousemove", move);
      
      self.#sliders[i].addEventListener("touchstart", start);
      window.addEventListener("touchend", end);
      document.body.addEventListener("touchmove", (e)=>{move(e.touches[0]);});
    }
    

    window.addEventListener("resize",()=>{
      this.#offsetX = this.#bar.getBoundingClientRect().left;
      this.#barWidth = this.#bar.clientWidth;
    });
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
    allTable: undefined,
    allBody:undefined,
    pinnedBody:undefined
  },
  sectionModal = {
    body: undefined,
    next: undefined,
    prev: undefined
  },
  coursesDropmenu = {
    body:undefined,
    hide(){
      if(this.body === undefined) return;
      this.body.style.display = "none";
      this.body.innerHTML = `<li class="dropdown-item">Nothing Found</li>`;
    },
    show(){
      if(this.body === undefined) return;
      this.body.innerHTML = "";
      this.body.style.display = "block";
    }
  },
  covers = {};


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
  const validProps = ["semester", "faculty", "department", "lineNumber", "symbol", "name"];
  let checked = false;

  const copy = { ...course };

  if (highlight != ""){
    //highlight = highlight.split(",");
    if (validProps.includes(prop)){
      //for (const text of highlight) {
        copy[p] = copy[p].replace(
          new RegExp(`(?=${highlight.trim()})`, "i"),
          '<span class="bg-warning">'
        ).replace(
          new RegExp(`(?<=${highlight.trim()})`, "i"),
          "</span>"
        );
      //}
    }
    else if(prop === "all"){
      for (const p of validProps) {
        copy[p] = copy[p].replace(
          new RegExp(`(?=${highlight.trim()})`, "i"),
          '<span class="bg-warning">'
        ).replace(
          new RegExp(`(?<=${highlight.trim()})`, "i"),
          "</span>"
        );
      }
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
      cousresModal.selected.push(course);
      card.className += " border-2 border-success shadow-lg";
    } else {
      let index = cousresModal.selected.findIndex((courseNum) => {
        return courseNum === course.lineNumber;
      });
      if (index != -1) {
        cousresModal.selected.splice(index, 1);
        card.className = card.className.replace(" border-2 border-success shadow-lg", "");
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

    coursesDropmenu.body = document.querySelector("#options .option[title=search] .dropdown-menu");

    const tRange = document.querySelector("#options .option[title=time] .doubleRange");
    options.time.range = new DoubleRange(tRange,8.5,18.5,0.5);

    let cov = document.querySelectorAll(".cover");
    for (const cover of cov) {
      let opName = cover.title;
      opName = opName.toLowerCase();
      covers[opName] = cover;
    }

    const t = document.getElementById("table");
    table.numOfTables = t.querySelectorAll(".input-group span")[1];
    table.indexInput = t.querySelector(".input-group input");
    table.allBody = t.querySelector("#all .timeTable");
    table.pinnedBody = t.querySelector("#pinned .timeTable");
    
    let tableBtns = t.querySelectorAll(".btn");
    for (const btn of tableBtns) {
      let opName = btn.innerText.trim();
      opName = opName.toLowerCase();
      table[opName+"Btn"] = btn;
    }
    table.unpinBtn.style.display = "none";

    const secModal = document.getElementById("sectionModal");
    sectionModal.body = secModal.querySelector(".modal-body .col-10");
    sectionModal.next = secModal.querySelector(".modal-body .next");
    sectionModal.prev = secModal.querySelector(".modal-body .prev");

    table.allTable = new ScheduleGroup(table.allBody,secModal);
    table.pinnedTable = new ScheduleGroup(table.pinnedBody,secModal);

    
    const cModal = document.getElementById("coursesModal");
    cousresModal.body = cModal.querySelector(".modal-body .row");
    cousresModal.title = cModal.querySelector(".modal-title");
    cousresModal.submit = cModal.querySelector(".btn-primary");
    cousresModal.cancel = cModal.querySelector(".btn-secondary");

    cousresModal.bootstrapModal = new bootstrap.Modal(cModal, {keyboard: false});
})();
(function addEvents() {
  
  { //options events
    let responseFlag = true;
    let abortReqController = new AbortController();
    let abortReqSignal = abortReqController.signal;
    const submitSearch = async function(displayMode = "dropdown") {
      //function to call when searching (by varius methods like mouse, keyboard)
      if(!responseFlag) return;

      if (options["search"].searchval.value.search(/\w.*\w/) == -1) {
        //val has at least 1s alpha-numeric chars
        coursesDropmenu.hide();
        return;
      }
      
      coursesDropmenu.show();

      responseFlag = false;
     
      
      try{
        var res = await app._searchFunction(options["search"].searchval.value, options["search"].searchby.value, abortReqSignal)
      }catch(err){
        if(err.message != "The user aborted a request.")
          console.error(err);
      }
      if(res){ //if no error
        responseFlag = true;
        
        if (res.courses.length < 1) {
            coursesDropmenu.body.innerHTML = `<li class="dropdown-item">Nothing Found</li>`;
            return;
        }

        if(displayMode === "modal"){
          updateModal(
              res.courses,
              "Found",
              "Add Courses",
              options["search"].searchval.value,
              options["search"].searchby.value
          );
          cousresModal.submitFunction = function () {
            for (const course of cousresModal.selected) {
              app._addCourseFunction(course);
            }
          };
          cousresModal.bootstrapModal.show();
        }
        else {
          const arr = res.courses.slice(0,10);
          for (const course of arr) {
            const courseCard = htmlCreator(
              "li", 
              coursesDropmenu.body, "", 
              "dropdown-item btn", 
              `${course.name} | ${course.symbol}`
            );
            
            courseCard.addEventListener("click", ()=>{
                  coursesDropmenu.hide();
                  const deepCopy = JSON.parse(JSON.stringify(course));
                  
                  app._addCourseFunction(course);
                  options["search"].searchval.value = "";
            });
          }
          const more = htmlCreator(
            "li", 
            coursesDropmenu.body, "", 
            "dropdown-item btn text-primary", 
            `View all results (${res.num} results found)`
          );
          more.title = "View all results";
          more.addEventListener("click", ()=>{
            updateModal(
              res.courses,
              "Found",
              "Add Courses",
              options["search"].searchval.value,
              options["search"].searchby.value
            );
            cousresModal.submitFunction = function () {
              for (const course of cousresModal.selected) {
                app._addCourseFunction(course);
              }
            };
            cousresModal.bootstrapModal.show();
          });
        }
          
        
      }
    };
    // let inputTimerID = null;
    options["search"].searchval.addEventListener("input", ()=>{
      if(!responseFlag){
        abortReqController.abort();
        
        responseFlag = true;
        abortReqController = new AbortController();
        abortReqSignal = abortReqController.signal;
      }
      submitSearch();
      // if(inputTimerID != null){
      //   clearTimeout(inputTimerID);
      //   inputTimerID = null;
      // }
      // inputTimerID = setTimeout(submitSearch , 0);
    });
    options["search"].searchval.addEventListener("click", submitSearch);
    options["search"].searchval.addEventListener("keydown", (event)=>{
      if(event.key === "Enter")
        if(!responseFlag){
          abortReqController.abort();
          console.log("abort");
          responseFlag = true;
          abortReqController = new AbortController();
          abortReqSignal = abortReqController.signal;
        }
        submitSearch("modal");
    });

    options["courses"].submit.addEventListener("click", function () {
      updateModal(app.courses, "My Courses: ", "Remove Courses");
      cousresModal.submitFunction = function () {
        for (const course of cousresModal.selected) {
          app._removeCourseFunction(course.lineNumber);
        }
      };
    });
    
    let daysString = "all";
    let dayStart = new Time(8.5 * 60);
    let dayEnd = new Time(18.5);
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
      dayStart.totalHours = this.minValue;
      dayEnd.totalHours = this.maxValue;

      options["time"].min.value = dayStart.string24
      options["time"].max.value = dayEnd.string24;

      app.setOptions(daysString, dayStart.totalHours, dayEnd.totalHours);
      // timeoutID = setTimeout(generate,100);//wait to stop changing for 100ms 
    };
    options["time"].min.addEventListener("change", function(){
      if(!Time.isValid(this.value)) {
        this.value = dayStart.string24;
        console.error("invalid time format");
        return;
      }
      if(Time.isOutOfBound(this.value, 8.5, 18.5)){
        this.value = dayStart.string24;
        console.error("invalid time. Please choose time between 8:30 and 18:30");
        return;
      }
      dayStart.setTime(this.value);
      this.value = dayStart.string24;
      
      options["time"].range.minValue = dayStart.totalHours;

      app.setOptions(daysString, dayStart.totalHours, dayEnd.totalHours);
    });
    options["time"].max.addEventListener("change", function(){
      if(!Time.isValid(this.value)) {
        this.value = dayEnd.string24;
        console.error("invalid time format");
        return;
      }
      if(Time.isOutOfBound(this.value, 8.5, 18.5)){
        this.value = dayEnd.string24;
        console.error("invalid time. Please choose time between 8:30 and 18:30");
        return;
      }
      
      dayEnd.setTime(this.value);
      this.value = dayEnd.string24;
      
      options["time"].range.maxValue = dayEnd.totalHours;

      app.setOptions(daysString, dayStart.totalHours, dayEnd.totalHours);
    });
  }

  { //table events
    let touchX=-1;
    let touchY = 0;
    options["generateschedule"].submit.addEventListener("click",async()=>{
      covers.table.className = covers.table.className.replace("hidden", ""); //display loading
      
      const arr = await app._generateScheduleFunction();
      for (const schedule of arr) {
        for(const sections of schedule){
          for (const sec of sections) {
            sec.timeObj = {
              start: new Time(sec.startTime * 60),
              end: new Time(sec.endTime * 60),
              delta(){return Time.subtract(this.end , this.start);},
              string: function () {
                return (
                  this.start.string24 +
                  " - " +
                  this.end.string24
                );
              },
            };
          }
        }
    
      }
      
      covers.table.className += "hidden";
      schedulesControls.updateSchedule(arr, true);
    });

    table.indexInput.addEventListener("change", function(){
      schedulesControls.changeActiveSchedule(parseInt(this.value));
    });
    for (const key in table) {
      if (key.includes("Btn")) {
        table[key].addEventListener("click", function(){
          const func = key.replace("Btn","") + "Schedule";
          schedulesControls[func]();
        });
      }
    }

    table.allBody.addEventListener("touchstart",function(event){
      if(touchX === -1){
        event.preventDefault();
        touchX = event.touches[0].clientX;
      }
      touchY = event.touches[0].clientY;
    });
    table.pinnedBody.addEventListener("touchstart",function(event){
      console.log("this is script js")
      if(touchX === -1){
        event.preventDefault();
        touchX = event.touches[0].clientX;
      }
      touchY = event.touches[0].clientY;
    });
    document.body.addEventListener("touchmove", function(event){
      if(touchX != -1){
        const deltaX = event.touches[0].clientX - touchX;
        const deltaY = event.touches[0].clientY - touchY;

        if(Math.abs(deltaY) > Math.abs(deltaX)){
          window.scrollBy(0,-deltaY);
          return;
        }

        if(deltaX > 50){
          schedulesControls.prevSchedule();
          touchX = -1;
        }
        else if(deltaX < -50){
          schedulesControls.nextSchedule();
          touchX = -1;
        }
      }
    });
  }

  sectionModal.next.addEventListener("click", function(){
    const t = table.allTable;
    t.changeActiveSec("",t.activeGroup.activeSecIndex + 1);
    t.displaySectionDetails();
  });
  sectionModal.prev.addEventListener("click", function(){
    const t = table.allTable;
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
      coursesDropmenu.hide();
    }
    else if(event.key === "ArrowRight"){
      schedulesControls.nextSchedule();
    }
    else if(event.key === "ArrowLeft"){
      schedulesControls.prevSchedule();
    }
  });
  window.addEventListener("click", (event)=>{
    if(!coursesDropmenu.body.contains(event.target) && !options.search.searchval.contains(event.target))
      coursesDropmenu.hide();
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

export {table, htmlCreator, random};