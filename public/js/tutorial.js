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
          this.tipsArr[this.st]("End");
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
    }
  );

  tips.tipsArr.push(addModal,searchTip, coursesTip, tableTip);
  addModal();
  
  function addElementTip(elem, opt, btnText){
    if(!opt) opt = {};
    elem.className += " tutorialFocus";

    let popover = bootstrap.Popover.getInstance(elem);
    if(!popover){
      popover = new bootstrap.Popover(elem, {
          container: 'body',
          trigger: "manual",
          html: true,
          title: opt.title || "Title",
          content: 
          `<div class="row g-0 justify-content-between">
            <p class="col-12">${(opt.text || "Text")}</p> 
            <!--<span class="btn btn-primary col-auto">Back</i></span> -->
            <span class="btn btn-primary ms-auto col-auto">${btnText || "Next"}</i></span>
          </div>`,
      });
      elem.addEventListener('shown.bs.popover', function(){
        const btns = document.querySelectorAll(".popover .btn");
        // btns[0].addEventListener("click", prev);
        btns[0].addEventListener("click", next);
      });
    }
    popover.show();	

    function next(){
      popover.hide();
      // popover.dispose();
      elem.className = elem.className.replace(" tutorialFocus", "");
      tips.step++;
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