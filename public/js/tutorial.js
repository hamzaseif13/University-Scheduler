import { htmlCreator } from "./script.js";

function playTutorial(mainCover){
  mainCover.className = mainCover.className.replace(/ ?hidden/, "");

  const tips = {
    tipsArr: [],//[()=>{console.log("welcome to Tutorial")}],
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
        mainCover.className+=" hidden";
        this.st = 0;
      }
    }
  }
  const mainSections = document.querySelectorAll("#container > div > div");
  const searchTip = addElementTip.bind(null,
    mainSections[0],
    {
      title: "Search Bar",
      text: "Add courses to your collection by choosing it from the search results"
    }
  );
  const coursesTip = addElementTip.bind(null,
    mainSections[1],
    {
      title: "Added Courses",
      text: "View your courses info and manipulate them"
    }
  );
  const tableTip = addElementTip.bind(null,
    mainSections[2],
    {
      title: "Schedules",
      text: "View generated schedules from best to worst"
    },
    {
      delay: 300
    }
  );
  const filterTip = addElementTip.bind(null,
    mainSections[1].querySelector(".btn.btn-primary"),
    {
      title: "Schedules Filter",
      text: "click this Button to open Filter Section"
    },
    {
      requireClick: true
    }
  );
  const optionsTip = addElementTip.bind(null,
    document.querySelector("#options"),
    {
      title: "Filters",
      text: "Select your prefered school days and hours and see all possible schedules"
    },
    {
      delay: 300
    }
  );
  const closeFilterTip = addElementTip.bind(null,
    document.querySelector("#optionsOffcanvas .btn-close"),
    {
      title: "Close Filter",
      text: "Exit filter section to return to normal view"
    },
    {
      requireClick: true
    }
  );

  addModal();
  tips.tipsArr.push(addModal,searchTip,coursesTip,filterTip,optionsTip,closeFilterTip,tableTip);
  
  function addElementTip(elem, content = {}, options = {}, ...addOpt){
    for (const obj of addOpt) {
      for(const prop in obj){
        options[prop] = obj[prop];
      }
    }
    
    elem.className += " tutorialFocus";

    if(options.requireClick){
      elem.addEventListener("click", next, {once : true});
    }
    let popover = bootstrap.Popover.getInstance(elem);
    if(!popover){
      let btnsHTML = 
      `<!--<span class="btn btn-primary col-auto">Back</i></span> -->
      <span class="btn btn-primary ms-auto col-auto">${options.nextBtnText || "Next"}</i></span>`;
      if(options.requireClick)btnsHTML = `<span class="ms-auto col-auto fs-6 text-secondary">Click Button to Cont.</span>`;

      popover = new bootstrap.Popover(elem, {
          container: 'body',
          trigger: "manual",
          html: true,
          title: content.title || "Title",
          content: 
          `<div class="row g-0 justify-content-between">
            <p class="col-12">${(content.text || "Text")}</p>
            ${btnsHTML}
          </div>`,
      });
      elem.addEventListener('shown.bs.popover', function(){
        const btns = document.querySelectorAll(".popover .btn");
        // btns[0].addEventListener("click", prev);
        if(btns[0]) btns[0].addEventListener("click", next);
      }, {once : true});
    }
    if(options.delay)
      setTimeout(popover.show.bind(popover), options.delay);
    else
      popover.show();


    if(options.apply)options.apply({elem,next,popover});

    function next(){
      popover.hide();
      // popover.dispose();
      elem.className = elem.className.replace(" tutorialFocus", "");
      tips.step++;
      if(options.next)
        options.next({elem,next,popover});
  }
    function prev(){
      popover.hide();
      elem.className = elem.className.replace(" tutorialFocus", "");
      tips.step--;
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