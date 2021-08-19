import app from "./Scheduler.js";
import {table,htmlCreator,tableCover} from "./script.js"

const colors = {
  array: [],
  cg:0,
  set colorGroup(cg){
    cg%=3;
    this.cg = cg;
  },
  get colorGroup(){
    for(let i=0;i<20;i++){
      colors.array[i]=(`hsl(${(( 0+ 120*this.cg)/6+i)*6%360},90%, 60%)`);
    }
    return this.cg;}
};

class TimeTable {
  #sectionGroups;
  #columns;
  #table;
  #modal;
  #activeGroupIndex;
  #menuButtons;
  #menu;
  constructor(table ,modal) {
    this.#sectionGroups = [];
    this.#columns = [];
    this.#menuButtons = {
      print:undefined,
      pin:undefined,
      delete:undefined,
      removeCourse:undefined
    };
    this.#modal = {
      body: modal.querySelector(".modal-body .col-10"),
      title: modal.querySelector(".modal-title"),
      bootstrapModal: new bootstrap.Modal(modal)
    }
    this.cellHeight = undefined;
    this.#activeGroupIndex = undefined;

    this.#table = table;
    this.#columns = table.querySelectorAll(".tableCol");
    this.#updateCellHeight();
    this.#resizeEvents();
    this.#rightClick();
  }
  addSection(secGroup) {
    const secCard = this.#generateHTMLSectionCard(secGroup);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu"];
    const clones = [];
    const groupIndex = this.#sectionGroups.length;
    
    for (let i = 0; i < 5; i++) {
      if (secGroup[0].days.includes(days[i])) {
        const clone = secCard.cloneNode(true);
        this.#columns[i].appendChild(clone);
        clones.push(clone);
      }
    }
    for (const clone of clones) {
      clone.addEventListener("click",(event)=>{
        this.#activeGroupIndex = groupIndex;
        if(event.target.className.includes("dropdown-item")){
          const secNum = event.target.innerHTML.replace("Sec: ","");
          this.changeActiveSec(secNum);
        }
        else if(!event.target.className.includes("badge")){
          this.displaySectionDetails();
        }
      });
    }
    this.#sectionGroups.push({ 
      cards: clones, 
      arr: secGroup ,
      set activeSecIndex(i){this._index = (i+this.arr.length)%this.arr.length;},
      get activeSecIndex(){return this._index;},
      _index:0
    });
  }
  changeActiveSec(activeSecNum, activeSecIndex = ""){
    if(this.#activeGroupIndex == undefined){
      return;
    }
    const secGroup = this.#sectionGroups[this.#activeGroupIndex];
    if(activeSecIndex === "")
      activeSecIndex = secGroup.arr.findIndex((val)=>{
        return val.sectionNumber == activeSecNum
      });
    secGroup.activeSecIndex = activeSecIndex;
    const cardsBody = secGroup.cards.map((val)=>{
      return val.querySelector(".cardBody");
    });
    for (const cardBody of cardsBody) {
      cardBody.children[1].innerHTML = "Sec: " + secGroup.arr[secGroup.activeSecIndex].sectionNumber;
    }
  }
  displaySectionDetails(){
    if(this.#activeGroupIndex == undefined){
      return;
    }
    const secGroup = this.#sectionGroups[this.#activeGroupIndex];
    const sec = secGroup.arr[secGroup.activeSecIndex];
    const col = htmlCreator("div", "", "", "col");

    let card = htmlCreator("div", col, "", "card shadow");

    let cardBody = htmlCreator("div", card, "", "card-body");
    htmlCreator("h5", cardBody, "", "card-title", sec.course.name);

    let listGroup = htmlCreator("ol", card, "", "list-group list-group-flush");
    htmlCreator(
      "li",
      listGroup,
      "",
      "list-group-item",
      '<span class="h6">Symbol:</span> ' + sec.course.symbol
    );
    htmlCreator(
      "li",
      listGroup,
      "",
      "list-group-item",
      '<span class="h6">Section:</span> ' + sec.sectionNumber
    );
    htmlCreator(
      "li",
      listGroup,
      "",
      "list-group-item",
      '<span class="h6">Instructor:</span> ' + sec.instructor
    );
    htmlCreator(
      "li",
      listGroup,
      "",
      "list-group-item",
      '<span class="h6">Days:</span> ' + sec.days
    );
    htmlCreator(
      "li",
      listGroup,
      "",
      "list-group-item",
      '<span class="h6">Time:</span> ' + sec.timeObj.string()
    );
    htmlCreator(
      "li",
      listGroup,
      "",
      "list-group-item",
      '<span class="h6">Credit Hours:</span> ' + sec.course.creditHours
    );
    this.#modal.title.innerHTML = `Section ${this.activeGroup.activeSecIndex+1} of ${this.activeGroup.arr.length}`;
    this.#modal.body.innerHTML = "";
    this.#modal.body.appendChild(col);
    this.#modal.bootstrapModal.show();
  }
  #generateHTMLSectionCard(sections) {
    
    let card = htmlCreator(
      "div",
      "",
      "",
      "dropend card text-center w-100 overflow-visible fw-bold"
    );
    card.style.position = "absolute";
    card.style.height = this.cellHeight * sections[0].timeObj.deltaT() + "px";
    card.style.top =
      this.cellHeight *
        (((sections[0].timeObj.start.h - 8 + 12) % 12) + sections[0].timeObj.start.m / 60) +
      "px";

    let colIndex = 0;
    let str = sections[0].course.name;
    str += sections[0].course.lineNumber
    str += sections[0].course.symbol;
    for (let i = 0;i<str.length;i++){
      let a = parseInt(str[i].charCodeAt());
      if(isNaN(a))a=i;
      colIndex += 2*a;
    }
    card.style.backgroundColor = colors.array[colIndex%colors.array.length];
    card.style.cursor = "pointer";
    card.title = "Show Details";

    let cardBody = htmlCreator("div", card, "", "m-auto cardBody");
    // cardBody.style.fontSize = "x-small";
    htmlCreator("div", cardBody, "", "", sections[0].course.symbol);
    htmlCreator("div", cardBody, "", "", "Sec: " + sections[0].sectionNumber);
    htmlCreator("div", cardBody, "", "", sections[0].timeObj.string());

    if(sections.length > 1){
      let badge = htmlCreator("span",card,"","dropdown-toggle btn position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger " , sections.length)
      badge.style.zIndex = 100;
      badge.setAttribute("data-bs-toggle","dropdown");
      badge.title = "More Sections";

      let list = htmlCreator("ul", card, "", "dropdown-menu");
      list.title = "Change Section";
      list.style.minWidth = "fit-content";
      
      for (let i=0;i<sections.length;i++) {
        let item = htmlCreator("a",htmlCreator("li",list),"","dropdown-item","Sec: "+ sections[i].sectionNumber);
      }
    }

    return card;
  }
  #resizeEvents() {
    window.addEventListener("resize", () => {
      const oldHeight = this.cellHeight;
      this.#updateCellHeight();
      
      const cards = this.#table.querySelectorAll(".card");
      for (const card of cards) {
        card.style.height =
          (parseFloat(card.style.height) / oldHeight) * this.cellHeight + "px";
        card.style.top =
          (parseFloat(card.style.top) / oldHeight) * this.cellHeight + "px";
      }
    });
  }
  #rightClick(){
    const self = this;
    this.#menu = htmlCreator("ul",this.#table,"","dropdown-menu");
    for (const btn in this.#menuButtons) {
      let name = btn.split(/(?=[A-Z])/);
      name = name.map((val)=>{
        return val[0].toUpperCase() + val.slice(1);
      });
      this.#menuButtons[btn] = htmlCreator("button","","","dropdown-item",name.join(" "));
      this.#menuButtons[btn].addEventListener("click", ()=>{
        this[btn+"Function"]();
      });
    }
    this.#table.addEventListener("contextmenu",(event)=>{
      event.preventDefault();
      const buttons = ["print","pin","delete"]
      if(event.target.className.includes("card") || event.target.parentElement.className.includes("card"))
        buttons.push("removeCourse");
      this.#contextMenu(event.x,event.y,buttons);
    });
    window.addEventListener("click",()=>{
      this.#menu.style.display = "none";
    })
  }
  #contextMenu(x,y,buttonNames){
    const offsetX = this.#table.getBoundingClientRect().left;
    const offsetY = this.#table.getBoundingClientRect().top;
    const tableWidth = this.#table.offsetWidth;
    const tableHeight = this.#table.offsetHeight;

    this.#menu.innerHTML = "";
    for (const btn of buttonNames) {
      const li = htmlCreator("li",this.#menu);
      li.appendChild(this.#menuButtons[btn]);
    }
    this.#menu.style.display = "block";
    
    x = Math.min(x - offsetX, tableWidth - this.#menu.offsetWidth - 3);
    y = Math.min(y - offsetY, tableHeight - this.#menu.offsetHeight - 3);
    
    this.#menu.style.left = x + "px";
    this.#menu.style.top = y + "px";
  }
  reset(){
    for (const col of this.#columns) {
      col.innerHTML = "";
    }
    this.#updateCellHeight();
  }
  #updateCellHeight(){
    this.cellHeight = this.#table.querySelector(".hours").offsetHeight;

    for (const col of this.#columns) {
      col.style.backgroundImage =
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
      "width='" +
      this.cellHeight / 2 +
      "' height='" +
      this.cellHeight / 2 +
      "' viewBox='0 0 100 100'%3E%3Cg stroke='%23000000' stroke-width='1' " +
      "%3E%3Crect fill='%23e9e9e9' x='-60' y='-60' width='240' height='60'/%3E%3C/g%3E%3C/svg%3E\")";
    }
  }
  printFunction(){
    printSchedule();
  }
  deleteFunction(){
    deleteSchedule();
  }
  pinFunction(){
    pinSchedule();
  }
  get activeGroup(){
    return {...this.#sectionGroups[this.#activeGroupIndex]};
  }
}

let schedules = [], scheduleIndex = 0;
const pinned = [];
function displaySchedule(){
  table.indexInput.value = (scheduleIndex + 1) ;
  table.numOfTables.innerHTML = " / " + Math.max(1,schedules.length);
  if(schedules.length == 0){
    table.tableObj.reset();
    return;
  }
  table.tableObj.reset();
  for (const sec of schedules[scheduleIndex].sections) {
    table.tableObj.addSection(Array.isArray(sec)?sec:[sec]);
  }
}
function generate(changeColor){
  if(changeColor)
    colors.colorGroup +=1;

  tableCover.className = tableCover.className.replace("hidden",""); //display loading
  setTimeout(()=>{//to make the browser render the change first then execute _generateScheduleFunction
    schedules = app._generateScheduleFunction();
    calcScore();
    tableCover.className += "hidden";
    scheduleIndex = 0;
    displaySchedule();
  }, 5)
}
function calcScore(){
  let i = 0;
  for (const s of schedules) {
    const obj = {};
    obj.id = i;
    obj.sections = s;

    obj.score = i;

    schedules[i++] = obj;
  }
}

function changeActiveSchedule(val){
  if(val > schedules.length ||val < 1){
    if(val == schedules.length+1 || val == 0)
      val = (val + schedules.length - 1)%schedules.length+1;
    else{
      displaySchedule();
      return val;
    }
  }

  scheduleIndex = val - 1;
  displaySchedule();
  return val;
}
function nextSchedule(){
  changeActiveSchedule(scheduleIndex + 1 + 1);
}
function prevSchedule(){
  changeActiveSchedule(scheduleIndex - 1 + 1);
}
function deleteSchedule(){
  schedules.splice(scheduleIndex,1);
  if(scheduleIndex == schedules.length)
    scheduleIndex--;
  
    displaySchedule();
}
function pinSchedule(){
  if(pinned.find((val)=>{return val.id === schedules[scheduleIndex].id}) === undefined)
    pinned.unshift(schedules[scheduleIndex]);
  
    displaySchedule();
}
function printSchedule(){
  console.log(schedules[scheduleIndex]);
}


export default{
  generate, 
  changeActiveSchedule,
  nextSchedule,
  prevSchedule,
  deleteSchedule,
  pinSchedule,
  printSchedule
};
export {TimeTable};