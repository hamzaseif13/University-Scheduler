import app from "./generator.js";
import schedulesControls from "./Generated Schedules.js";
import  {ScheduleGroup} from "./Generated Schedules.js";
import {Time} from "./Database.js";
import * as tutorial from "./tutorial.js"

window.tutorial = tutorial;
export const resizeContainerEvent = new Event("container.resize");

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
      function start(event){
          event.preventDefault();
          self.#offsetX = self.#bar.getBoundingClientRect().left;
          document.body.addEventListener("mousemove", move);
          document.body.addEventListener("touchmove", touchMove);
      // self.#barWidth = self.#bar.clientWidth;
      }
      function end(){
          document.body.removeEventListener("mousemove", move);
          document.body.removeEventListener("touchmove", touchMove);
      }
      function move(event){
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
      function touchMove(e){
        move(e.touches[0]);
      }
      self.#sliders[i].addEventListener("mousedown", start);
      window.addEventListener("mouseup", end);
      
      self.#sliders[i].addEventListener("touchstart", start);
      window.addEventListener("touchend", end);
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
    content: undefined,
    indexInput: undefined,
    nextBtn: undefined,
    prevBtn: undefined,
    allTable: undefined,
    allBody:undefined,
    pinnedBody:undefined,
    dragLeft: undefined,
    dragRight: undefined
  },
  sectionModal = {
    bootstrapModal:undefined,
    body: undefined,
    next: undefined,
    prev: undefined,
    title: undefined
  },
  coursesDropmenu = {
    body:undefined,
    hide(){
      if(this.body === undefined) return;
      this.body.style.display = "none";
      this.body.innerHTML = `<li class="dropdown-item text-wrap">Nothing Found</li>`;
    },
    show(){
      if(this.body === undefined) return;
      this.body.innerHTML = "";
      this.body.style.display = "block";
    },
    set loading(val){
      if(val){
        this.body.innerHTML = `<li class="dropdown-item w-100 d-flex align-items-center"><strong>Searching for Course...</strong><div class="spinner-border ms-5"></div></li>`;
      }
      else{
        this.body.innerHTML = "";
      }
    }
  },
  coursesTable = {
    body: undefined,
    modal:{
      courseTbody: undefined,
      sectionsTbody: undefined,
      bootstrapModal: undefined
    },
    counter: 0,
    cardsNum: [],
    coursesNum: [],
    addCourseCard(course){
      if(this.coursesNum.findIndex((cNum)=>cNum === course.lineNumber) != -1){
        return;
      }
      const self = this;

      this.coursesNum.push(course.lineNumber);
      const copy = {};
      copy.name = course.name;
      copy.symbol = course.symbol;
      copy.creditHours = course.creditHours;
      copy.lineNumber = course.lineNumber
      copy.faculty = course.faculty
      copy.department = course.department
      copy.sections = course.sections

      const row = htmlCreator("tr", this.body);

      const num = htmlCreator("th", row, "", "", ++this.counter);
      this.cardsNum.push(num);

      htmlCreator("td", row, "", "", copy.lineNumber);
      htmlCreator("td", row, "", "", copy.name.toLowerCase());
      htmlCreator("td", row, "", "", copy.symbol.toUpperCase());
      htmlCreator("td", row, "", "", copy.creditHours);
      
      const actionCol = htmlCreator("td", row);
      const deleteBtn = htmlCreator("button",actionCol, "", "btn btn-outline-danger me-1", `<i class="fas fa-trash-alt"></i>`);
      const detailsBtn = htmlCreator("button",actionCol, "", "btn btn-outline-info", `<i class="fas fa-info"></i>`);
      

      deleteBtn.addEventListener("click", function(){
        self.coursesNum.splice(num.innerText - 1, 1);
        self.cardsNum.splice(num.innerText - 1, 1);
        this.parentNode.parentNode.remove();
        self.counter--;

        for(let i=0; i<self.counter; i++){
          self.cardsNum[i].innerHTML = i+1;
        }

        app._removeCourseFunction(course.lineNumber);
        updateGenerated();
      });
      detailsBtn.addEventListener("click", function(){
        self.modal.bootstrapModal.show();
        const row = htmlCreator("tr", self.modal.courseTbody);
        htmlCreator("td", row, "", "", copy.faculty);
        htmlCreator("td", row, "", "", copy.department);
        htmlCreator("td", row, "", "", copy.lineNumber);
        htmlCreator("td", row, "", "", copy.name.toLowerCase());
        htmlCreator("td", row, "", "", copy.symbol.toUpperCase());
        htmlCreator("td", row, "", "", copy.creditHours);

        for (const sec of copy.sections) {
          const row = htmlCreator("tr", self.modal.sectionsTbody);
          htmlCreator("td", row, "", "", sec.sectionNumber);
          htmlCreator("td", row, "", "", sec.days);
          htmlCreator("td", row, "", "", sec.time);
          htmlCreator("td", row, "", "", sec.hall);
          htmlCreator("td", row, "", "", sec.seatCount);
          htmlCreator("td", row, "", "", sec.capacity);
          htmlCreator("td", row, "", "", sec.registered);
          htmlCreator("td", row, "", "", sec.instructor);
          htmlCreator("td", row, "", "", sec.teachingType);
        }
      })
    }
  },
  tutorialToast = {
    elem: undefined,
    bootstrapToast: undefined,
    submitBtn: undefined
  },
  covers = {};
let oldCoursesLength = 0;
let changeFilter = false;

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
  cousresModal.selected = [];
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
    highlight = highlight.trim();
    if (validProps.includes(prop)){
      //for (const text of highlight) {
        copy[p] = copy[p].replace(
          new RegExp(`(?= ${highlight}|^${highlight})`, "i"),
          '<span class="bg-warning">'
        ).replace(
          new RegExp(`(?<= ${highlight}|^${highlight})`, "i"),
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
      let index = cousresModal.selected.findIndex((c) => {
        return c.lineNumber === course.lineNumber;
      });
      if (index != -1) {
        cousresModal.selected.splice(index, 1);
        card.className = card.className.replace(" border-2 border-success shadow-lg", "");
      }
    }
  });

  return col;
}
function addTimeObj(arr){
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
}
async function updateGenerated(){
  if(oldCoursesLength === app.courses.length && !changeFilter)return;
  changeFilter = false;
  oldCoursesLength = app.courses.length;

  covers.table.className = covers.table.className.replace("hidden", ""); //display loading
  
  const arr = await app._generateScheduleFunction();
  addTimeObj(arr);
  
  covers.table.className += "hidden";
  schedulesControls.updateSchedule(arr, true);
}
(function getElements() {
  
    let cov = document.querySelectorAll(".cover");
    for (const cover of cov) {
      let opName = cover.title || cover.ariaLabel;
      opName = opName.toLowerCase();
      covers[opName] = cover;
    }
  
  //this code gets the inputs of all options and puts them in #options
    //in this order #options = {option1Name:{input1Name, option1Name, ...}}
    //#options.option1Name.option1Name.innerHTML = "dvz"
    let opt = document.querySelectorAll(".option");
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

    coursesDropmenu.body = document.querySelector(".option[title=search] .dropdown-menu");

    const tRange = document.querySelector(".option[title=time] .doubleRange");
    options.time.range = new DoubleRange(tRange,8.5,20.5,0.5);

    const t = document.getElementById("table");
    table.content = t.querySelector(".content");
    table.numOfTables = t.querySelector("#tableInput span");
    table.indexInput = t.querySelector("#tableInput input");
    table.allBody = t.querySelector("#all .timeTable");
    table.pinnedBody = t.querySelector("#pinned .timeTable");
    [table.dragLeft , table.dragRight] = t.querySelectorAll(".dragArrow");
    
    let tableBtns = t.querySelectorAll(".btn");
    for (const btn of tableBtns) {
      let opName = btn.name || btn.innerText;
      opName = opName.trim();
      opName = opName.toLowerCase();
      if(opName != "filter")
        table[opName+"Btn"] = btn;
    }
    table.unpinBtn.style.display = "none";

    const secModal = document.getElementById("sectionModal");
    sectionModal.body = secModal.querySelector(".modal-body .col-10");
    sectionModal.next = secModal.querySelector(".modal-body .next");
    sectionModal.prev = secModal.querySelector(".modal-body .prev");
    sectionModal.title = secModal.querySelector(".modal-title");

    sectionModal.bootstrapModal = new bootstrap.Modal(secModal, {keyboard: false});

    table.allTable = new ScheduleGroup(table.allBody,sectionModal);
    table.pinnedTable = new ScheduleGroup(table.pinnedBody,sectionModal);

    const cModal = document.getElementById("coursesModal");
    cousresModal.body = cModal.querySelector(".modal-body .row");
    cousresModal.title = cModal.querySelector(".modal-title");
    cousresModal.submit = cModal.querySelector(".btn-primary");
    cousresModal.cancel = cModal.querySelector(".btn-secondary");

    cousresModal.bootstrapModal = new bootstrap.Modal(cModal, {keyboard: false});

    const optionsOffcanvas = document.getElementById('optionsOffcanvas');
    //shrink container
    optionsOffcanvas.addEventListener('show.bs.offcanvas', function () {
      document.documentElement.style.setProperty("--container-width", "calc(100vw - 250px)");
      setTimeout(()=>{window.dispatchEvent(resizeContainerEvent);}, 300)
    });
    //expand container
    optionsOffcanvas.addEventListener('hide.bs.offcanvas', function () {
      document.documentElement.style.setProperty("--container-width", "100vw");
      setTimeout(()=>{window.dispatchEvent(resizeContainerEvent);}, 300)
    });

    coursesTable.body = document.querySelector("#coursesTable tbody");
    const courseDetailsModal = document.querySelector("#courseDetailsModal");
    coursesTable.modal.courseTbody = courseDetailsModal.querySelector("tbody");
    coursesTable.modal.sectionsTbody = courseDetailsModal.querySelectorAll("tbody")[1];
    coursesTable.modal.bootstrapModal = new bootstrap.Modal(courseDetailsModal, {keyboard: false});

    const toast = document.querySelector(".toast");
    tutorialToast.elem = toast;
    tutorialToast.submitBtn = toast.querySelector(".btn");
    tutorialToast.bootstrapToast = new bootstrap.Toast(toast);
    tutorialToast.bootstrapToast.show();
})();
(function addEvents() {
  { //options events
    options["generateschedule"].submit.addEventListener("click",updateGenerated);
    
    let responseFlag = true;
    let abortReqController = new AbortController();
    let abortReqSignal = abortReqController.signal;
    let lastSearch = "";
    let lastResult = [];
    let modalFlag = false;

    const submitSearch = async function() {
      //function to call when searching (by varius methods like mouse, keyboard)
      if(!responseFlag) return;

      if (options["search"].searchval.value.search(/\w.*\w/) == -1) {
        //val has at least 1s alpha-numeric chars
        coursesDropmenu.hide();
        return;
      }
      coursesDropmenu.show();
      coursesDropmenu.loading = true;

      responseFlag = false;

      let res;
      if(options["search"].searchval.value != lastSearch){
        lastSearch = options["search"].searchval.value;
        try{
          res = await app._searchFunction(options["search"].searchval.value, "all", abortReqSignal);
          res = res.courses;
        }catch(err){
          if(err.message != "The user aborted a request.")
            console.error(err);
        }
      }
      else{
        res = lastResult;
      }
      
      if(res){ //if no error
        lastResult = res;
        responseFlag = true;
        coursesDropmenu.loading = false;
        
        if (res.length < 1) {
            coursesDropmenu.body.innerHTML = `<li class="dropdown-item">Nothing Found</li>`;
            return;
        }

        if(modalFlag){
          updateModal(
              res,
              "Found",
              "Add Courses",
              options["search"].searchval.value,
              "all"
          );
          cousresModal.submitFunction = function () {
            for (const course of cousresModal.selected) {
              app._addCourseFunction(course);
              coursesTable.addCourseCard(course);
              updateGenerated();
            }
          };
          cousresModal.bootstrapModal.show();
        }
        else {
          const arr = res.slice(0,10);
          for (const course of arr) {
            const courseCard = htmlCreator(
              "li", 
              coursesDropmenu.body, "", 
              "dropdown-item btn", 
              `${course.name} | ${course.symbol}`
            );
            
            courseCard.addEventListener("click", ()=>{
                  coursesDropmenu.hide();
                  // const deepCopy = JSON.parse(JSON.stringify(course));
                  
                  app._addCourseFunction(course);
                  coursesTable.addCourseCard(course);
                  updateGenerated();
                  options["search"].searchval.value = "";
            });
          }
          if(res.length > 10){
            const more = htmlCreator(
              "li", 
              coursesDropmenu.body, "", 
              "dropdown-item btn text-primary", 
              `View all results (${res.num} results found)`
            );
            more.title = "View all results";
            more.addEventListener("click", ()=>{
              updateModal(
                res,
                "Found",
                "Add Courses",
                options["search"].searchval.value,
                "all"
              );
              cousresModal.submitFunction = function () {
                for (const course of cousresModal.selected) {
                  app._addCourseFunction(course);
                  coursesTable.addCourseCard(course);
                  updateGenerated();
                }
              };
              cousresModal.bootstrapModal.show();
            });
          }
          
        }
      }
      modalFlag = false;
    };
    // let inputTimerID = null;
    // options["search"].searchval.addEventListener("input", );
    options["search"].searchval.oninput = function(){
      if(!responseFlag && this.value != lastSearch){
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
    }
    options["search"].searchval.addEventListener("click", submitSearch);
    options["search"].searchval.addEventListener("keydown", (event)=>{
      if(event.key === "Enter"){
      modalFlag = true;
      if(responseFlag)
        submitSearch();
      }
    });

    // options["courses"].submit.addEventListener("click", function () {
    //   updateModal(app.courses, "My Courses: ", "Remove Courses");
    //   cousresModal.submitFunction = function () {
    //     for (const course of cousresModal.selected) {
    //       app._removeCourseFunction(course.lineNumber);
    //     }
    //   };
    // });
    
    let daysString = "all";
    let dayStart = new Time(8.5 * 60);
    let dayEnd = new Time(20.5);
    for(const day in options["days"]){
      options.days[day].addEventListener("change", function(){
        changeFilter = true;
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
      changeFilter = true;
      // clearTimeout(timeoutID);
      dayStart.totalHours = this.minValue;
      dayEnd.totalHours = this.maxValue;

      options["time"].min.value = dayStart.string12;
      options["time"].max.value = dayEnd.string12;

      app.setOptions(daysString, dayStart.totalHours, dayEnd.totalHours);
      // timeoutID = setTimeout(generate,100);//wait to stop changing for 100ms 
    };
    options["time"].min.addEventListener("change", function(){
      if(!Time.isValid(this.value)) {
        this.value = dayStart.string24;
        console.error("invalid time format");
        return;
      }
      if(Time.isOutOfBound(this.value, 8.5, 20.5)){
        this.value = dayStart.string24;
        console.error("invalid time. Please choose time between 8:30 and 18:30");
        return;
      }
      changeFilter = true;
      dayStart.setTime(this.value);
      this.value = dayStart.string12;
      
      options["time"].range.minValue = dayStart.totalHours;

      app.setOptions(daysString, dayStart.totalHours, dayEnd.totalHours);
    });
    options["time"].max.addEventListener("change", function(){
      if(!Time.isValid(this.value)) {
        this.value = dayEnd.string24;
        console.error("invalid time format");
        return;
      }
      if(Time.isOutOfBound(this.value, 8.5, 20.5)){
        this.value = dayEnd.string24;
        console.error("invalid time. Please choose time between 8:30 and 18:30");
        return;
      }
      changeFilter = true;
      dayEnd.setTime(this.value);
      this.value = dayEnd.string12;
      
      options["time"].range.maxValue = dayEnd.totalHours;

      app.setOptions(daysString, dayStart.totalHours, dayEnd.totalHours);
    });
  }

  { //table events
    let touchX=-1;
    let touchY = 0;
    let status = 0;//0 -> none | 1 -> next | -1 -> prev

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

    // table.content.addEventListener("touchstart",function(event){
    //   if(touchX === -1){
    //     event.preventDefault();
    //     touchX = event.touches[0].clientX;
    //   }
    //   touchY = event.touches[0].clientY;
    // });
    // document.body.addEventListener("touchmove", function(event){
    //   if(touchX != -1){
    //     const deltaX = event.touches[0].clientX - touchX;
    //     const deltaY = event.touches[0].clientY - touchY;

    //     if(Math.abs(deltaY) > Math.abs(deltaX)){
    //       window.scrollBy(0,-deltaY);
    //       return;
    //     }

    //     if(deltaX > 0){
    //       table.dragLeft.style.left = Math.min(10,-70 + deltaX) + "px";
    //       table.dragRight.style.right = "-70px";
    //     }
    //     else{
    //       table.dragRight.style.right = Math.min(10,-70 - deltaX) + "px";
    //       table.dragLeft.style.left = "-70px";
    //     }
    //     if(deltaX > 80){
    //       touchX = -1;
    //       status = -1;
    //     }
    //     else if(deltaX < -80){
    //       touchX = -1;
    //       status = 1;
    //     }
    //   }
    // });
    // document.body.addEventListener("touchend",()=>{
    //   table.dragLeft.style.left = "-70px";
    //   table.dragRight.style.right = "-70px";
      
    //   if(status === -1)
    //     schedulesControls.prevSchedule();
    //   else if(status === 1)
    //     schedulesControls.nextSchedule();

    //   status = 0;
    // })
  }

  tutorialToast.submitBtn.addEventListener("click", tutorial.playTutorial, true);

  sectionModal.next.addEventListener("click", function(){
    const t = schedulesControls.getActiveTable().tableObj;
    t.changeActiveSec("",t.activeGroup.activeSecIndex + 1);
    t.displaySectionDetails();
  });
  sectionModal.prev.addEventListener("click", function(){
    const t = schedulesControls.getActiveTable().tableObj;
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
  
  covers["main cover"].addEventListener("click", (ev)=>{ev.stopPropagation();})
  
})();
document.body.querySelector(".tip").addEventListener("click", ()=>{tutorial.filterTip()});

window.addEventListener("load",async function(){
  const pinnedArr = await app.getUserPinned();
    addTimeObj(pinnedArr);
    for (const schedule of pinnedArr) {
      table.pinnedTable.addSchedule(schedule);
    }
});

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