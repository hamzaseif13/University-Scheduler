import app from "./Scheduler.js";
//processed data from HTMLData var from data.js file


class TimeTable {
  #sections;
  #columns;
  constructor() {
    this.#sections = [];
    this.#columns = [];
    this.cellHeight =
      Math.max(window.innerHeight, window.innerWidth) *
      (50 / 100) *
      (90 / 100) *
      (9 / 100); //css: 100vmax * 90% * 9%(.timeTable[height] * .tableCol[height] * .hours[height])

    this.table = this.#generateHTMLTable();

    this.#resizeEvents();
  }
  addSection(sec) {
    const secCard = this.#generateHTMLSectionCard(sec);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu"];
    for (let i = 0; i < 5; i++) {
      if (sec.days.includes(days[i])) {
        this.#columns[i].appendChild(secCard.cloneNode(true));
      }
      this.#sections.push({ card: secCard, obj: sec });
    }
  }
  #generateHTMLSectionCard(sec) {
    const self = this;

    let card = htmlCreator(
      "div",
      "",
      "",
      "card text-center w-100 overflow-hidden fw-bold"
    );
    card.style.position = "absolute";
    card.style.height = this.cellHeight * sec.timeObj.deltaT() + "px";
    card.style.top =
      this.cellHeight *
        (((sec.timeObj.start.h - 8 + 12) % 12) + sec.timeObj.start.m / 60) +
      "px";

    card.style.backgroundColor = `rgb(${random(100, 230)},${random(
      100,
      230
    )},${random(100, 230)})`;

    let cardBody = htmlCreator("div", card, "", "m-auto ");
    cardBody.style.fontSize = "x-small";
    htmlCreator("div", cardBody, "", "", sec.course.symbol);
    htmlCreator("div", cardBody, "", "", "Sec: " + sec.sectionNumber);
    htmlCreator("div", cardBody, "", "", sec.timeObj.string());

    return card;
  }
  #generateHTMLTable() {
    const table = htmlCreator("div", "", "", "timeTable row row-cols-6 g-0");

    const headTitles = ["#", "Sun", "Mon", "Tue", "Wed", "Thu"];
    for (const head of headTitles) {
      htmlCreator("div", table, "", "tableHead",head);
    }
    const tableKeys = htmlCreator("div", table, "", "tableKeys");
    for (let i = 8; i <= 18; i++) {
      htmlCreator(
        "div",
        tableKeys,
        "",
        "hours",
        `<span>${i <= 12 ? i : i % 12}:30 ${i < 12 ? "AM" : "PM"}</span>`
      );
    }
    for (let i = 0; i < 5; i++) {
      this.#columns[i] = htmlCreator("div", table, "", "tableCol");
      {
        this.#columns[i].style.backgroundImage =
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
          "width='" +
          this.cellHeight / 2 +
          "' height='" +
          this.cellHeight / 2 +
          "' viewBox='0 0 100 100'%3E%3Cg stroke='%23000000' stroke-width='1' " +
          "%3E%3Crect fill='%23e9e9e9' x='-60' y='-60' width='240' height='60'/%3E%3C/g%3E%3C/svg%3E\")";
      }
      //add lines to table columns as background
    }

    return table;
  }
  #resizeEvents() {
    window.addEventListener("resize", () => {
      const oldHeight = this.cellHeight;
      this.cellHeight =
        Math.max(window.innerHeight, window.innerWidth) *
        (50 / 100) *
        (90 / 100) *
        (9 / 100);

      for (const col of this.#columns)
        col.style.backgroundImage =
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
          "width='" +
          this.cellHeight / 2 +
          "' height='" +
          this.cellHeight / 2 +
          "' viewBox='0 0 100 100'%3E%3Cg stroke='%23000000' stroke-width='1' " +
          "%3E%3Crect fill='%23e9e9e9' x='-60' y='-60' width='240' height='60'/%3E%3C/g%3E%3C/svg%3E\")";

      const cards = table.querySelectorAll(".card");
      for (const card of cards) {
        card.style.height =
          (parseFloat(card.style.height) / oldHeight) * this.cellHeight + "px";
        card.style.top =
          (parseFloat(card.style.top) / oldHeight) * this.cellHeight + "px";
      }
    });
  }
  reset(){
    for (const col of this.#columns) {
      col.innerHTML = "";
    }
    this.cellHeight =
    Math.max(window.innerHeight, window.innerWidth) *
    (50 / 100) *
    (90 / 100) *
    (9 / 100);
  }
}

const options = {},
  myModal = {
    bootstrapModal: undefined,
    body: undefined,
    title: undefined,
    submit: undefined,
    submitFunction: undefined, //this is used to change the function of the submit button (add/remove courses)
    cancel: undefined,
    selected: [], //contains the line numbers of the selected courses in the modal
  },
  table = {
    title:undefined,
    content:undefined,
    next:undefined,
    prev:undefined,
    tableObj:undefined
  };

let matchedCourses = [];



function updateModal(
  arr,
  title = "Found",
  submitBtn = "Submit",
  highlight = "",
  prop = ""
) {
  myModal.title.innerHTML = title + "  " + arr.length + " items";
  myModal.submit.innerHTML = submitBtn;
  myModal.body.innerHTML = "";
  for (const course of arr) {
    myModal.body.appendChild(
      generateHTMLCourseCard(course, highlight, prop)
    );
  }
}
function generateHTMLCourseCard(course, highlight = "", prop = "") {
  let checked = false;

  const copy = { ...course };

  if (highlight != "")
    if (typeof copy[prop] === "string")
      copy[prop] = copy[prop].replace(
        new RegExp(highlight.trim(), "i"),
        '<span class="bg-warning">' + highlight + "</span>"
      );
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
    //event to add course to #myModal.selected if card is clicked
    checked = !checked;
    if (checked) {
      myModal.selected.push(course.lineNumber);
      card.className += " border-success";
    } else {
      let index = myModal.selected.findIndex((courseNum) => {
        return courseNum === course.lineNumber;
      });
      if (index != -1) {
        myModal.selected.splice(index, 1);
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
        inputName = inputName.toLowerCase();
        options[opName][inputName] = input;
      }
      options[opName]["submit"] = option.querySelector(".submit");
    }

    const t = document.getElementById("table");
    table.title = t.querySelector(".title");
    table.content = t.querySelector(".content");
    table.next = t.querySelector(".next");
    table.prev = t.querySelector(".prev");

    table.tableObj = new TimeTable();
    table.content.appendChild(table.tableObj.table);

    const modal = document.getElementById("myModal");
    myModal.body = modal.querySelector(".modal-body .row");
    myModal.title = modal.querySelector(".modal-title");
    myModal.submit = modal.querySelector(".btn-primary");
    myModal.cancel = modal.querySelector(".btn-secondary");

    myModal.bootstrapModal = new bootstrap.Modal(modal, {keyboard: false});

})();
(function addEvents() {

  { //options events
    const option = options["search"];
    const submitSearch = function() {
      //function to call when searching (by varius methods like mouse, keyboard)
      if (option.searchval.value.search(/\w.*\w/) == -1) {
        //val has at least 2s alpha-numeric chars
        updateModal([], "Found", "Add Courses"); //to reset modal
        return;
      }
      matchedCourses = app["_searchFunction"](
        option.searchval.value,
        option.searchby.value
      );
      updateModal(
        matchedCourses,
        "Found",
        "Add Courses",
        option.searchval.value,
        option.searchby.value
      );
      myModal.submitFunction = function () {
        for (const lineNum of myModal.selected) {
          app._addCourseFunction(lineNum);
        }
      };
    };
    option.submit.addEventListener("click", submitSearch);
    option.searchval.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        submitSearch();
        myModal.bootstrapModal.show();
      }
    });
    options["courses"].submit.addEventListener("click", function () {
      updateModal(app.courses, "My Courses: ", "Remove Courses");
      myModal.submitFunction = function () {
        for (const lineNum of myModal.selected) {
          app._removeCourseFunction(lineNum);
        }
      };
    });
  }

  { //table events
    let schedules = [], scheduleIndex = 0;
    const displaySchedule = function(){
      table.title.innerHTML = "Schedule No. "+ (scheduleIndex + 1) +" / " + schedules.length;
      if(schedules.length == 0)
        return;
      table.tableObj.reset();
      for (const sec of schedules[scheduleIndex]) {
        table.tableObj.addSection(Array.isArray(sec)?sec[0]:sec);
      }
    }

    options["generateschedule"].submit.addEventListener("click",()=>{
      schedules = [...app._generateScheduleFunction()];
      scheduleIndex = 0;
      displaySchedule();
    });

    table.next.addEventListener("click", function(){
      scheduleIndex++;
      scheduleIndex = scheduleIndex >= schedules.length? 0 : scheduleIndex;
      displaySchedule();
    });
    table.prev.addEventListener("click", function(){
      scheduleIndex--;
      scheduleIndex = scheduleIndex < 0? schedules.length - 1: scheduleIndex;
      displaySchedule();
    });
  }

  myModal.submit.addEventListener("click", function () {
    myModal.submitFunction();
    myModal.bootstrapModal.hide();
    myModal.selected = [];
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