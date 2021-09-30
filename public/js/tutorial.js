import { htmlCreator } from "./script.js";

function playTutorial(){
  const toastCont = htmlCreator("div", document.body, "", "toast-container position-fixed top-0 w-100 mt-5 d-flex justify-content-center");
  const escapeToastEl = htmlCreator("div",toastCont,"","toast rounded-pill border-1 border-dark text-white",`
    <div class="toast-body text-center">
      <h4>Press ESC to exit Tutorial</h4>
    </div>
  `)
  escapeToastEl.style.backgroundColor = "#000000a0";
  toastCont.style.zIndex = "100000";
  const escapeToast = new bootstrap.Toast(escapeToastEl);
  escapeToast.show();
  escapeToastEl.addEventListener("hidden.bs.toast", ()=>{escapeToast.dispose(); toastCont.remove()}, {once:true});

  const tips = {
    tipsArr: [],
    st: 0,
    get step(){
      return this.st;
    },
    set step(s){
      this.st = s;
      if(typeof this.tipsArr[this.st] === "function")
        if(this.st === this.tipsArr.length - 1){
          this.tipsArr[this.st]({nextBtnText:"End"});
        }
        else
          this.tipsArr[this.st]();
      else{
        this.st = 0;
      }
    }
  };
  document.body.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      tips.step = -1;
    }
  },
  {
    once:true
  })
  const mainSections = document.querySelectorAll("#container > div > div");
  const searchTip = (opt)=>{
    addElementTip(
      mainSections[0].querySelector("input"),
      {
        title: "Search Bar",
        text: "Add courses to your collection by choosing it from the search results"
      },
      {
        input:{
          value: "arabic",
          delay: 50,
          behavior: "smooth"
        }
      },
      opt
    );
  }
  const addCourseTip = (opt)=>{
    addElementTip(
      mainSections[0].querySelector(".dropdown-menu"),
      {
        title: "Add a Course",
        text: "Click on the course you want to add it to your collection"
      },
      {
        requireClick: true
      },
      opt
    );
  }
  const coursesTip = (opt)=>{
    addElementTip(
      mainSections[1],
      {
        title: "View Added Courses",
        text: "View your courses info and manipulate them"
      },
      {
        disableElements: mainSections[1].querySelectorAll(".btn-outline-danger")
      },
      opt
    );
  }
  const removeCourseTip = (opt)=>{
    addElementTip(
      mainSections[1].querySelector(".btn-outline-danger"),
      {
        title: "Remove Course",
        text: "Click this Button to open Filter Section"
      },
      {
        focusElement: mainSections[1],
        disableElements: mainSections[1].querySelectorAll(".btn-outline-danger")
      },
      opt
    );
  }
  const filterTip = (opt)=>{
    addElementTip(
      mainSections[1].querySelector(".btn.btn-primary"),
      {
        title: "Schedules Filter",
        text: "Click this Button to open Filter Section"
      },
      {
        requireClick: true
      },
      opt
    );

  }
  const optionsTip = (opt)=>{
    addElementTip(
      document.querySelector("#options"),
      {
        title: "Filters",
        text: "Select your prefered school days and hours and see all possible schedules"
      },
      {
        delay: 300,
        focusElement: document.querySelector("#optionsOffcanvas"),
        disableElements: document.querySelectorAll("#optionsOffcanvas .btn-close")
      },
      opt
    );
  }
  const closeFilterTip = (opt)=>{
    addElementTip(
      document.querySelector("#optionsOffcanvas .btn-close"),
      {
        title: "Close Filter",
        text: "Exit filter section to return to normal view"
      },
      {
        focusElement: document.querySelector("#optionsOffcanvas"),
        requireClick: true
      },
      opt
    );
  }
  const tableTip = (opt)=>{
    addElementTip(
      mainSections[2],
      {
        title: "Schedules",
        text: "View generated schedules from best to worst"
      },
      {
        delay: 300,
        placment: "top"
      },
      opt
    );
  }

  const tableControllsTip = (opt)=>{
    addElementTip(
      mainSections[2].querySelector("div.col-12"),
      {
        title: "Table Controlls",
        text: "View generated schedules from best to worst"
      },
      {
        background: "white"
      },
      opt
    );
  }

  addModal();
  tips.tipsArr.push(addModal,searchTip,addCourseTip,coursesTip,removeCourseTip,filterTip,optionsTip,closeFilterTip,tableTip,tableControllsTip);
  
  function addElementTip(elem, content = {}, options = {}, ...addOpt){
    for (const obj of addOpt) {
      for(const prop in obj){
        options[prop] = obj[prop];
      }
    }
    if(options.disableElements){
      const elems = options.disableElements;
      for (const el of elems) {
        el.className += " disabled";
      }
    }
    let focusElement = elem;
    if(options.focusElement){
      focusElement = options.focusElement;
    }
    if(options.background){
      focusElement.style.backgroundColor = options.background;
    }
    const cover = htmlCreator("div", focusElement.parentNode, "", "cover position-fixed vw-100 vh-100");
    focusElement.className += " tutorialFocus";

    if(options.delay){
      setTimeout(()=>{elem.scrollIntoView({behavior: "smooth", block: "nearest"});}, options.delay);
    }else{
      elem.scrollIntoView({behavior: "smooth", block: "nearest"});
    }
    
    if(options.requireClick){
      elem.addEventListener("click", next, {once : true});
    }

    let btnsHTML = 
    `<!--<span class="btn btn-primary col-auto">Back</i></span> -->
    <span class="btn btn-primary ms-auto col-auto">${options.nextBtnText || "Next"}</i></span>`;
    if(options.requireClick)btnsHTML = `<span class="ms-auto col-auto fs-6 text-secondary">Click Button to Cont.</span>`;

    let popover = new bootstrap.Popover(elem, {
        container: 'body',
        trigger: "manual",
        placment: options.placment || "auto",
        html: true,
        title: content.title || "Title",
        content: 
        `<div class="row g-0 justify-content-between">
          <p class="col-12">${(content.text || "Text")}</p>
          ${btnsHTML}
        </div>`,
    });
    elem.addEventListener('shown.bs.popover', function(){
      const popoverElem = document.querySelector(".popover");
      const btns = popoverElem.querySelectorAll(".btn");
      // btns[0].addEventListener("click", prev);
      if(btns[0]) btns[0].addEventListener("click", next);
      popoverElem.addEventListener("click", (ev)=>{ev.stopPropagation();});
    }, {once : true});
    elem.addEventListener("click", (ev)=>{ev.stopPropagation();});
    document.body.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
      }
    })

    if(options.delay){
      setTimeout(popover.show.bind(popover), options.delay);
    }else{
      popover.show();
    }

    if(options.input){
      const inp = options.input;
      if(!inp.elem)inp.elem = elem.querySelector("input") || elem;

      inp.elem.focus();
      if(inp.delay){
        setTimeout(()=>{
          inp.elem.value = inp.value;
          inp.elem.oninput();
        }, inp.delay)
      }
      else{
        inp.elem.value = inp.value;
        inp.elem.oninput();
      }
    }

    if(options.apply)options.apply({elem,next,popover});

    function next(){
      close();
      tips.step++;
    }

    function close(){
      popover.hide();
      elem.addEventListener("hidden.bs.popover", ()=>{popover.dispose();}, {once:true})

      cover.remove();
      focusElement.className = focusElement.className.replace(" tutorialFocus", "");
      if(options.background){
        focusElement.style.backgroundColor = "";
      }
      if(options.disableElements){
        const elems = options.disableElements;
        for (const el of elems) {
          el.className = el.className.replace(/ ?disabled/, "");
        }
      }
    }
  }
  function addModal(){
    let elem = document.querySelector(".modal.tipModal");
    let modal;
    if(!elem){
      elem = htmlCreator("div", document.body, "", "modal tipModal", 
        `<div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header ">
              <h5 class="modal-title">Welcome to <strong>Jadwali</strong></h5>
              <button type="button" class="btn btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>
                This tutorial will teach you about the main parts of <strong>Jadwali</strong>
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Skip</button>
              <button type="button" class="btn btn-primary">Start Tutorial</button>
            </div>
          </div>
        </div>`
      );
      elem.style.zIndex = "100000";
      modal = new bootstrap.Modal(elem, {
        keyboard: false,
        backdrop: "static"
      });
      elem.addEventListener("shown.bs.modal", function(){
        const btns = elem.querySelectorAll(".btn");
        btns[0].addEventListener("click", cancel);
        btns[1].addEventListener("click", cancel);
        btns[2].addEventListener("click", start);
      })
      document.body.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          modal.hide();
        }
      })
    }
    else{
      modal = bootstrap.Modal.getInstance(elem);
      // if(!modal){
      //   modal = new bootstrap.Modal(elem, {
      //     keyboard: false,
      //     backdrop: "static"
      //   });
      // }
    }
    modal.show();

    function cancel(){
      modal.hide();
      tips.step--;
    }
    function start(){
      modal.hide();
      tips.step++;
    }
  }
}



export {playTutorial};