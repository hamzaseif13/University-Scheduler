// import app from "./generator.js";
import { table, htmlCreator } from "./script.js";
import calcScore from "./Calculate Score.js";
// import { advancedSearch } from "./Database.js";
const html2pdf = window.html2pdf;

const colors = {
  arr: [],
  get array() {
    if(this.arr.length < 60){
      for (let i = 0; i < 60; i++) {
        this.arr[i] = `hsl(${(i * 6) % 360
          },90%, 60%)`;
      }
    }
    return this.arr;
  },
};

class TimeTable {
  #sectionGroups;
  #columns;
  #table;
  #modal;
  #activeGroupIndex;
  #menuButtons;
  #menu;
  constructor(table, modal) {
    this.#sectionGroups = [];
    this.#columns = [];
    this.#menuButtons = {
      print: undefined,
      pin: undefined,
      delete: undefined,
      removeCourse: undefined,
    };
    this.#modal = {
      body: modal.body,
      title: modal.title,
      bootstrapModal: modal.bootstrapModal,
    };
    this.cellHeight = undefined;
    this.#activeGroupIndex = undefined;

    this.#table = table;
    this.#columns = table.querySelectorAll(".tableCol");
    this.updateCellHeight();
    this.#resizeEvents();
    this.#rightClick();
  }
  addSection(secGroup) {
    const secCard = this.#generateHTMLSectionCard(secGroup);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu"];
    const clones = [];
    const groupIndex = this.#sectionGroups.length;

    this.#columns[0].appendChild(secCard.card);
    secCard.checkOverflow();
    secCard.card.remove();

    for (let i = 0; i < 5; i++) {
      if (secGroup[0].days.includes(days[i])) {

        const clone = secCard.card.cloneNode(true);
        this.#columns[i].appendChild(clone);
        
        clones.push(clone);
      }
    }
    for (const clone of clones) {
      clone.addEventListener("click", (event) => {
        this.#activeGroupIndex = groupIndex;
        if (event.target.className.includes("dropdown-item")) {
          const secNum = event.target.innerHTML.replace("Sec: ", "");
          this.changeActiveSec(secNum);
        } else if (!event.target.className.includes("badge")) {
          this.displaySectionDetails();
        }
      });
    }
    this.#sectionGroups.push({
      cards: clones,
      arr: secGroup,
      set activeSecIndex(i) {
        this._index = (i + this.arr.length) % this.arr.length;
      },
      get activeSecIndex() {
        return this._index;
      },
      _index: 0,
    });
  }
  changeActiveSec(activeSecNum, activeSecIndex = "") {
    if (this.#activeGroupIndex == undefined) {
      return;
    }
    const secGroup = this.#sectionGroups[this.#activeGroupIndex];
    if (activeSecIndex === "")
      activeSecIndex = secGroup.arr.findIndex((val) => {
        return val.sectionNumber == activeSecNum;
      });
    secGroup.activeSecIndex = activeSecIndex;
    const cardsBody = secGroup.cards.map((val) => {
      return val.querySelector(".cardBody");
    });
    for (const cardBody of cardsBody) {
      cardBody.querySelector("p").innerHTML =
        "Sec: " + secGroup.arr[secGroup.activeSecIndex].sectionNumber;
    }
  }
  displaySectionDetails() {
    if (this.#activeGroupIndex == undefined) {
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
      '<span class="h6">Line Number:</span> ' + sec.course.lineNumber
    );
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
    this.#modal.title.innerHTML = `Section ${this.activeGroup.activeSecIndex + 1
      } of ${this.activeGroup.arr.length}`;
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
    card.style.height =
      this.cellHeight * sections[0].timeObj.delta().totalHours + "px";
    card.style.top =
      this.cellHeight * (sections[0].timeObj.start.totalHours - 8) + "px";

    let colIndex = 0;
    let str = sections[0].course.name;
    str += sections[0].course.lineNumber;
    str += sections[0].course.symbol;
    for (let i = 0; i < str.length; i++) {
      let a = parseInt(str[i].charCodeAt());
      if (isNaN(a)) a = i;
      colIndex += 2 * a;
    }
    card.style.backgroundColor = colors.array[colIndex % colors.array.length];
    card.style.cursor = "pointer";
    card.title = "Show Details";

    let cardBody = htmlCreator("div", card, "", "m-auto cardBody overflow-hidden");
    // cardBody.style.fontSize = "x-small";
    const tElem = htmlCreator("time", cardBody, "", "", sections[0].timeObj.string());
    const dElem = htmlCreator("div", cardBody, "", "", sections[0].course.symbol);
    const pElem = htmlCreator("p", cardBody, "", "m-0 p-0", "Sec: " + sections[0].sectionNumber);
    // htmlCreator("div", cardBody, "", "", sections[0].timeObj.string());

    if (sections.length > 1) {
      let badge = htmlCreator(
        "span",
        card,
        "",
        "dropdown-toggle btn position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger dynamic-fs-s",
        sections.length
      );
      badge.style.zIndex = 100;
      badge.setAttribute("data-bs-toggle", "dropdown");
      badge.title = "Similar Sections";
      badge.style.fontSize = "small";

      let list = htmlCreator("ul", card, "", "dropdown-menu");
      list.title = "Change Section";
      list.style.minWidth = "fit-content";

      for (let i = 0; i < sections.length; i++) {
        let item = htmlCreator(
          "a",
          htmlCreator("li", list),
          "",
          "dropdown-item",
          "Sec: " + sections[i].sectionNumber
        );
      }
    }

    return {
      card,
      checkOverflow(){
        if(cardBody.offsetHeight < tElem.offsetHeight + dElem.offsetHeight + pElem.offsetHeight || 
          card.offsetWidth < cardBody.offsetWidth
          ){
          tElem.style.display = "none";
        }
        else{
          tElem.style.display = "block";
        }
      }
    };
  }
  #resizeEvents() {
    window.addEventListener("container.resize", () => {
      const oldHeight = this.cellHeight;
      this.updateCellHeight();

      const cards = this.#table.querySelectorAll(".card");
      for (const card of cards) {
        card.style.height =
          (parseFloat(card.style.height) / oldHeight) * this.cellHeight + "px";
        card.style.top =
          (parseFloat(card.style.top) / oldHeight) * this.cellHeight + "px";
      }
    });
    window.addEventListener("resize", () => {
      const oldHeight = this.cellHeight;
      this.updateCellHeight();

      const cards = this.#table.querySelectorAll(".card");
      for (const card of cards) {
        card.style.height =
          (parseFloat(card.style.height) / oldHeight) * this.cellHeight + "px";
        card.style.top =
          (parseFloat(card.style.top) / oldHeight) * this.cellHeight + "px";
      }
    });
  }
  #rightClick() {
    const self = this;
    this.#menu = htmlCreator("ul", this.#table, "", "dropdown-menu");
    for (const btn in this.#menuButtons) {
      let name = btn.split(/(?=[A-Z])/);
      name = name.map((val) => {
        return val[0].toUpperCase() + val.slice(1);
      });
      this.#menuButtons[btn] = htmlCreator(
        "button",
        "",
        "",
        "dropdown-item",
        name.join(" ")
      );
      this.#menuButtons[btn].addEventListener("click", () => {
        this[btn + "Function"]();
      });
    }
    this.#table.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const buttons = ["print", "pin", "delete"];
      if (
        event.target.className.includes("card") ||
        event.target.parentElement.className.includes("card")
      )
        buttons.push("removeCourse");
      this.#contextMenu(event.x, event.y, buttons);
    });
    window.addEventListener("click", () => {
      this.#menu.style.display = "none";
    });
  }
  #contextMenu(x, y, buttonNames) {
    const offsetX = this.#table.getBoundingClientRect().left;
    const offsetY = this.#table.getBoundingClientRect().top;
    const tableWidth = this.#table.offsetWidth;
    const tableHeight = this.#table.offsetHeight;

    this.#menu.innerHTML = "";
    for (const btn of buttonNames) {
      const li = htmlCreator("li", this.#menu);
      li.appendChild(this.#menuButtons[btn]);
    }
    this.#menu.style.display = "block";

    x = Math.min(x - offsetX, tableWidth - this.#menu.offsetWidth - 3);
    y = Math.min(y - offsetY, tableHeight - this.#menu.offsetHeight - 3);

    this.#menu.style.left = x + "px";
    this.#menu.style.top = y + "px";
  }
  reset() {
    for (const col of this.#columns) {
      col.innerHTML = "";
    }
    this.updateCellHeight();
  }
  updateCellHeight() {
    this.cellHeight = this.#table.querySelector(".tableCol").offsetHeight * 1 / 13;

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
  printFunction() {
    printSchedule();
  }
  deleteFunction() {
    deleteSchedule();
  }
  pinFunction() {
    console.log("pinnied")
    pinSchedule();
  }
  get activeGroup() {
    return { ...this.#sectionGroups[this.#activeGroupIndex] };
  }
}

class ScheduleGroup {
  #schedules;
  #activeIndex;
  #tableObj;
  constructor(table, modal) {
    this.#schedules = [];
    this.#tableObj = new TimeTable(table, modal);
    this.#activeIndex = 0;

    // this.days = app.getDays();
  }
  display() {
    this.#tableObj.reset();
    if (this.#schedules.length == 0) return;

    for (const sec of this.activeSchedule) {
      this.#tableObj.addSection(Array.isArray(sec) ? sec : [sec]);
    }
  }
  get activeSchedule() {
    if (this.numOfSchedules == 0) return [];
    return this.#schedules[this.#activeIndex];
  }
  get activeIndex() {
    return this.#activeIndex;
  }
  get numOfSchedules() {
    return this.#schedules.length;
  }
  get tableObj(){
    return this.#tableObj;
  }
  addSchedule(s) {
    if(this.searchScheduleIndex(s) != -1){
      console.error("Duplicate Schedule");
      return;
    }
    if(s.length === 0){
      console.error("Empty Schedule");
      return;
    }

    this.#schedules.push(s);
  }
  changeActiveIndex(val) {
    if (val >= this.#schedules.length || val < 0) {
      if (this.#schedules.length === 0) val = 0;
      else if (val == this.#schedules.length || val == -1)
        val = (val + this.#schedules.length) % this.#schedules.length;
      else {
        return val;
      }
    }

    this.#activeIndex = val;
    return val;
  }
  nextSchedule() {
    this.changeActiveIndex(this.#activeIndex + 1);
  }
  prevSchedule() {
    this.changeActiveIndex(this.#activeIndex - 1);
  }
  deleteSchedule(schedule) {
    if (this.numOfSchedules == 0) return;

    let index;
    if (schedule != undefined) index = this.searchScheduleIndex(schedule);
    else index = this.#activeIndex;
    this.#schedules.splice(index, 1);

    if (this.#activeIndex != 0 && this.#activeIndex == this.numOfSchedules)
      this.#activeIndex--;
  }
  searchScheduleIndex(schedule) {
    if(!Array.isArray(schedule) || schedule.length === 0){
      return -1;
    }
    return this.#schedules.findIndex((val) => {
      return this.hashSchedule(val) === this.hashSchedule(schedule);
    });
  }
  #calcScore(s) {
    s.score = calcScore(s);
  }
  refreshTable() {
    this.#tableObj.updateCellHeight();
  }
  reset() {
    this.#tableObj.reset();
    this.#schedules = [];
    this.#activeIndex = 0;
  }
  hashSchedule(s){
    let hashArr = [];
    if(!Array.isArray(s)){
      console.error("Can Not Calculate Hash");
      return;
    }
    if(s.length === 0){
      console.error("Empty Schedule");
      return;
    }
    for(let sec of s){
      if(Array.isArray(sec))sec = sec[0];
      hashArr.push(sec.course.symbol + "-" + sec.sectionNumber);
    }
    hashArr.sort();
    let hash = hashArr.join(",");
    return hash;
  }
  stats() {
    const weekDays = ["sun", "mon", "tue", "wed", "thu", "sat"];
    const obj = {
      daysNum: [0, 0, 0, 0, 0, 0],
    };
    for (const schedule of this.#schedules) {
      const sections = schedule.map((val) => val[0]);
      let daysNum = 0;
      for (const day of weekDays) {
        // if (advancedSearch(sections, false, [day, "days"]).length >= 1)
        //   daysNum++;
      }
      {
        //num of days
        obj.daysNum[daysNum]++;
      }
      {
        //avg on campus hours per school day
      }
    }

    console.log(obj);
    return obj;
  }
}

let activeTable;
let activeTab = "all";
let idCounter = 0;

setTimeout(() => {
  activeTable = table.allTable;
}, 0);

function displaySchedule() {
  table.indexInput.value = activeTable.activeIndex + 1;
  table.numOfTables.innerHTML = " / " + Math.max(1, activeTable.numOfSchedules);

  activeTable.display();

  if (activeTab != "pinned") {
    if (
      table.pinnedTable.searchScheduleIndex(activeTable.activeSchedule) != -1
    ) {
      table.pinBtn.style.display = "none";
      table.unpinBtn.style.display = "block";
    } else {
      table.pinBtn.style.display = "block";
      table.unpinBtn.style.display = "none";
    }
  }
}

//feature functions to control displayed schedule (invoked with user events)
function updateSchedule(arr, changeColor) {//called when generating schedules
  // if (changeColor) colors.colorGroup += 1;

  table.allTable.reset();
  for (const schedule of arr) {
    table.allTable.addSchedule(schedule);
  }

  table.allTable.changeActiveIndex(0);
  displaySchedule();
  // table.allTable.stats();
}
function changeActiveSchedule(val) {
  let res = activeTable.changeActiveIndex(val - 1);
  displaySchedule();
  return res;
}
function nextSchedule() {
  activeTable.nextSchedule();
  displaySchedule();
}
function prevSchedule() {
  activeTable.prevSchedule();
  displaySchedule();
}
// function deleteSchedule() {
//   const id = activeTable.activeSchedule.id;

//   table.allTable.deleteSchedule(id);
//   table.pinnedTable.deleteSchedule(id);

//   displaySchedule();
// }
async function pinSchedule() {
  let sentArr=[]
  if (table.pinnedTable.searchScheduleIndex(activeTable.activeSchedule) === -1) {
    //client pin
    table.pinnedTable.addSchedule(activeTable.activeSchedule);
    displaySchedule();
    //server pin
    const pinnedSchedule = activeTable.activeSchedule;
    // console.log(pinnedSchedule)
    for(let j=0;j<pinnedSchedule.length;j++){
      sentArr.push(pinnedSchedule[j][0].course.symbol+"-"+pinnedSchedule[j][0].sectionNumber)
    }
    sentArr.sort()
    try{
      await fetch("/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({sentArr})
      })
    }
    catch(err){console.error(err)}
    return false;
  }
  return true;
}
async function unpinSchedule() {
  let del=[]
  if (table.pinnedTable.searchScheduleIndex(activeTable.activeSchedule) != -1){
    //client
    table.pinnedTable.deleteSchedule(activeTable.activeSchedule.id);
    displaySchedule();
    //server
    const pinnedSchedule = activeTable.activeSchedule;
    // console.log(pinnedSchedule)
    for(let j=0;j<pinnedSchedule.length;j++){
      del.push(pinnedSchedule[j][0].course.symbol+"-"+pinnedSchedule[j][0].sectionNumber)
    }
    del.sort()
    try{
      await fetch("/unpin",{
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({del})
      })
    }catch(err){console.error(err)}
  }
}
function printSchedule() {
  const element = htmlCreator("div", "");
  (function addLayout() {
    htmlCreator("h5", element, "", "text-center", "Weekly Schedule");
    element.appendChild(table[activeTab + "Body"].cloneNode(true));
  })();
  let opt = {
    margin: 1,
    filename: "mySchedule.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 8 }, //, windowWidth: 500, windowHeight: 1000},
    jsPDF: { unit: "cm", format: "a5", orientation: "p" },
  };
  console.log(activeTable.activeSchedule);
  html2pdf(element, opt);
}
function pinnedSchedule() {
  activeTable = table.pinnedTable;
  activeTab = "pinned";
  setTimeout(() => {
    table.pinnedTable.refreshTable();
    table.pinBtn.style.display = "none";
    table.unpinBtn.style.display = "block";
    displaySchedule();
  }, 200);
}
function allSchedule() {
  activeTable = table.allTable;
  activeTab = "all";
  setTimeout(() => {
    table.pinBtn.style.display = "block";
    table.unpinBtn.style.display = "none";
    displaySchedule();
  }, 200);
}

function getActiveTable(){
  return activeTable;
}
export default {
  updateSchedule,
  changeActiveSchedule,
  nextSchedule,
  prevSchedule,
  // deleteSchedule,
  pinSchedule,
  unpinSchedule,
  printSchedule,
  pinnedSchedule,
  allSchedule,
  getActiveTable,
};
export { ScheduleGroup };
