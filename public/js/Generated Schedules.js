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
      const btns = clone.querySelectorAll(".card-header .btn");

      clone.addEventListener("click", (event) => {
        this.#activeGroupIndex = groupIndex;
        if (event.target.className.includes("dropdown-item")) {
          const secNum = event.target.innerHTML.replace("Sec: ", "");
          this.changeActiveSec(secNum);
        }
        else if(btns[0].contains(event.target)){
          this.#copyLineNumber(btns[0]);
        }
        else if(btns[1].contains(event.target)){
          this.displaySectionDetails();
        }
        else if(event.target.id === "offcanvasToggle"){
          this.#openOffcanvasToolbar();
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
  #copyLineNumber(elem){
    const secGroup = this.#sectionGroups[this.#activeGroupIndex];
    const sec = secGroup.arr[0];
    navigator.clipboard.writeText(sec.course.lineNumber).then(function() {
      addTooltip(elem, "Line Number Copied!");
    }, function() {
      addTooltip(elem, "Copy Failed!");
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
      return val.querySelector(".card-body");
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
      } of ${this.activeGroup.arr.length} <small class="text-muted fs-6 fw-normal">(of similar sections)</small>`;
    this.#modal.body.innerHTML = "";
    this.#modal.body.appendChild(col);
    this.#modal.bootstrapModal.show();
  }
  #openOffcanvasToolbar(){
    const secGroup = this.#sectionGroups[this.#activeGroupIndex];
    const sections = secGroup.arr;

    const offcanvas = htmlCreator("div", document.body, "bottom-toolbar", "offcanvas offcanvas-bottom");
    offcanvas.style.height = "fit-content";
    offcanvas.style.height = "-moz-fit-content";
    const offcanvasBody = htmlCreator("div", offcanvas, "", "offcanvas-body row row-cols-1 g-0 p-0");

    const copyBtn = htmlCreator("div", offcanvasBody, "", "col bg-light", `
    <div class="row g-0">
        <div class="col-2 text-center align-self-center"><i class="far fa-clipboard fs-1"></i></div>
        <div class="col">
            <div class="card border-0 bg-transparent">
                <div class="card-body">
                    <h4 class="card-title">Copy Line Number</h4>
                    <h6 class="text-muted card-subtitle mb-2">Copy <i>Course Line Number</i> to clipboard</h6>
                </div>
            </div>
        </div>
    </div>`);
    const detailsBtn = htmlCreator("div", offcanvasBody, "", "col bg-light", `
    <div class="row g-0">
        <div class="col-2 text-center align-self-center"><i class="fas fa-info fs-1"></i></div>
        <div class="col">
            <div class="card border-0 bg-transparent">
                <div class="card-body">
                    <h4 class="card-title">Section Details</h4>
                    <h6 class="text-muted card-subtitle mb-2">View the details of the section</h6>
                </div>
            </div>
        </div>
    </div>`);
    const pinBtn = htmlCreator("div", offcanvasBody, "", "col bg-light disabled", `
    <div class="row g-0">
        <div class="col-2 text-center align-self-center"><i class="fas fa-thumbtack fs-1"></i></div>
        <div class="col">
            <div class="card border-0 bg-transparent">
                <div class="card-body">
                    <h4 class="card-title">Pin Section</h4>
                    <h6 class="text-muted card-subtitle mb-2">Pin section in place</h6>
                </div>
            </div>
        </div>
    </div>`);
    if (sections.length > 1) {
      const similarSecBtn = htmlCreator("div", offcanvasBody, "", "col bg-light", `
      <div class="row g-0">
          <div class="col-2 text-center align-self-center"><i class="fas fa-list-ul fs-1"></i></div>
          <div class="col">
              <div class="card border-0 bg-transparent">
                  <div class="card-body">
                      <h4 class="card-title">Similar Sections</h4>
                      <h6 class="text-muted card-subtitle mb-2">Switch between sections with the same <i>Time</i> but different <i>Instructor/Hall</i></h6>
                  </div>
              </div>
          </div>
          <div class="col-2 align-self-center"><span class="badge bg-danger fs-6">${sections.length}</span></div>
      </div>`);
      let sectionsElem = "";
      for (let i = 0; i < sections.length; i++) {
        sectionsElem += 
        `<div class="list-group-item btn btn-light">
          <h4>Section ${sections[i].sectionNumber}</h4>
        </div>
        `
      }
      const modalElem = htmlCreator("div", document.body, "", "modal fade", 
      `<div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body">
            <ul class="list-group text-center">
              ${sectionsElem}
            </ul>
          </div>
        </div>
      </div>`);

      const modalObj = new bootstrap.Modal(modalElem);

      similarSecBtn.addEventListener("click", ()=>{modalObj.show()},{once:true});
      const secBtns = modalElem.querySelectorAll("ul .btn");
      for (const btn of secBtns) {
        btn.addEventListener("click", ()=>{
          const secNum = btn.innerText.replace("Section ", "");
          this.changeActiveSec(secNum);
          modalObj.hide();
        });
      }
      
      modalElem.addEventListener("hidden.bs.modal",()=>{
        modalObj.dispose();
        modalElem.remove();
      }, {once:true});
    }

    const offcanvasObj = new bootstrap.Offcanvas(offcanvas);
    offcanvasObj.show();

    offcanvas.addEventListener("click", (event)=>{
      if(copyBtn.contains(event.target)){
        this.#copyLineNumber(copyBtn);
      }
      else if(detailsBtn.contains(event.target)){
        this.displaySectionDetails();
      }
      else if(pinBtn.contains(event.target)){
        alert("pin in development");
      }
      offcanvasObj.hide();
    });
    offcanvas.addEventListener("hidden.bs.offcanvas",()=>{
      offcanvasObj.dispose();
      offcanvas.remove();
    }, {once:true});
  }
  #generateHTMLSectionCard(sections) {
    let card = htmlCreator(
      "div",
      "",
      "",
      "card text-center w-100 overflow-visible fw-bold position-absolute"
    );
    card.style.height =
      this.cellHeight * sections[0].timeObj.delta().totalHours + "px";
    card.style.top =
      this.cellHeight * (sections[0].timeObj.start.totalHours - 8) + "px";

    let colorIndex = 0;
    let str = sections[0].course.name;
    str += sections[0].course.lineNumber;
    str += sections[0].course.symbol;
    for (let i = 0; i < str.length; i++) {
      let a = parseInt(str[i].charCodeAt());
      if (isNaN(a)) a = i;
      colorIndex += 2 * a;
    }
    card.style.backgroundColor = colors.array[colorIndex % colors.array.length];
    
    const cardHeader = htmlCreator("div", card, "", "card-header position-absolute w-100 bg-light border d-none d-sm-block p-0");
    const btnsRow = htmlCreator("div", cardHeader, "", "row g-1 m-0 pb-1 text-center");
    const copyDiv = htmlCreator("div", btnsRow, "", "col");
    copyDiv.title="Copy Line Number";
    htmlCreator("button", copyDiv, "", "btn btn-primary btn-sm m-auto w-100", `<i class="far fa-clipboard"></i>`)
    const detailsDiv = htmlCreator("div", btnsRow, "", "col");
    detailsDiv.title="Section Details";
    htmlCreator("button", detailsDiv, "", "btn btn-primary btn-sm m-auto w-100", `<i class="fas fa-info"></i>`)
    const pinDiv = htmlCreator("div", btnsRow, "", "col");
    pinDiv.title="Pin Section";
    htmlCreator("button", pinDiv, "", "btn btn-primary btn-sm m-auto w-100 disabled", `<i class="fas fa-thumbtack"></i>`)

    const similarSecDiv = htmlCreator("div", btnsRow, "", "col dropend");
    similarSecDiv.title="Similar Sections";
    const similarSecBtn = htmlCreator("button", similarSecDiv, "", "btn btn-primary btn-sm m-auto w-100", `<i class="fas fa-list-ul"></i>`)
    similarSecBtn.setAttribute("data-bs-toggle", "dropdown");


    const cardBody = htmlCreator("div", card, "", "card-body d-flex overflow-hidden p-0");
    const dataDiv = htmlCreator("div", cardBody, "", "m-auto");
    const tElem = htmlCreator("time", dataDiv, "", "", sections[0].timeObj.string());
    const dElem = htmlCreator("div", dataDiv, "", "", sections[0].course.symbol);
    const pElem = htmlCreator("p", dataDiv, "", "m-0 p-0", "Sec: " + sections[0].sectionNumber);

    const offcanvasToggle = htmlCreator("a", card, "offcanvasToggle", "position-absolute top-0 start-0 w-100 h-100 d-sm-none");
    offcanvasToggle.style.zIndex = 200;
    
    

    

    if (sections.length > 1) {
      let badge = htmlCreator(
        "span",
        similarSecBtn,
        "",
        "badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle",
        sections.length
      );

      let list = htmlCreator("ul", similarSecDiv, "", "dropdown-menu");
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
    else{
      similarSecDiv.remove();
    }

    return {
      card,
      checkOverflow(){
        if(cardBody.offsetHeight < dataDiv.offsetHeight || 
          card.offsetWidth < cardBody.offsetWidth //need check
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
      table.pinBtn.parentNode.style.display = "none";
      table.unpinBtn.style.display = "";
    } else {
      table.pinBtn.parentNode.style.display = "";
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
    table.pinBtn.parentNode.style.display = "none";
    table.unpinBtn.style.display = "";
    displaySchedule();
  }, 200);
}
function allSchedule() {
  activeTable = table.allTable;
  activeTab = "all";
  setTimeout(() => {
    table.pinBtn.parentNode.style.display = "";
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

function addTooltip(elem, text, hideDelay = 1000){
  const tooltip = new bootstrap.Tooltip(elem,{
    title: text
  })
  tooltip.show();
  setTimeout(()=>{tooltip.hide();}, hideDelay);
  elem.addEventListener("hidden.bs.tooltip", ()=>{tooltip.dispose();}, {once:true})
}