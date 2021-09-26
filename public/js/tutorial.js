
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
        this.tipsArr[this.st]();
      else
        mainCover.className+=" hidden";
    }
  }
  const mainSections = document.querySelectorAll("#container > div > div");
  const searchTip = addElementTip.bind(null,
    mainSections[0],
    {
      title: "Search Bar",
      text: "You can add courses to your collection by choosing it from the search results"
    },
    ()=>{tips.step--;},
    ()=>{tips.step++;}
  );
  const coursesTip = addElementTip.bind(null,
    mainSections[1],
    {
      title: "Added Courses",
      text: "You can add courses to your collection by choosing it from the search results"
    },
    ()=>{tips.step--;},
    ()=>{tips.step++;}
  );
  const tableTip = addElementTip.bind(null,
    mainSections[2],
    {
      title: "Schedule",
      text: "You can add courses to your collection by choosing it from the search results"
    },
    ()=>{tips.step--;},
    ()=>{tips.step++;}
  );

  tips.tipsArr.push(searchTip, coursesTip, tableTip);
  searchTip();

}

function addElementTip(elem, opt, nextBtnFunction, prevBtnFunction){
  if(!opt) opt = {};
  let newInstanceflag = true;
  elem.className += " tutorialFocus";
  elem.addEventListener('shown.bs.popover', function(){
    if(!newInstanceflag)
      return;
    const btns = document.querySelectorAll(".popover .btn");
    btns[0].addEventListener("click", next);
    btns[1].addEventListener("click", prev);
  });

  const controlls = `<span onclick="prev()" class="btn btn-primary col-2"><i class="fas fa-chevron-left"></i></span>
  <span onclick="next()" class="btn btn-primary col-2"><i class="fas fa-chevron-right"></i></span>`
  
  let popover = bootstrap.Popover.getInstance(elem);
  newInstanceflag = !popover;
  if(newInstanceflag){
    popover = new bootstrap.Popover(elem, {
        container: 'body',
        trigger: "manual",
        html: true,
        title: opt.title || "Title",
        content: `<div class="row g-0 justify-content-between"><p class="col-12">${(opt.text || "Text")}</p> ${controlls}</div>`,
    });
  }
  popover.show();	
  function next(){
    popover.hide();
    elem.className = elem.className.replace(" tutorialFocus", "");
    if(nextBtnFunction) nextBtnFunction();
  }
  function prev(){
    popover.hide();
    elem.className = elem.className.replace(" tutorialFocus", "");
    if(prevBtnFunction) prevBtnFunction();
  }
}


var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

console.log("2345678");

export {playTutorial};