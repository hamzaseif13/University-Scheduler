import processor from "./generator.js";
import ui from "./script.js";
import { htmlCreator } from "./script.js";


export const searchRequst = {
    abortReqController: new AbortController(),
    get abortReqSignal(){return this.abortReqController.signal;},
    responseFlag: true,
    result: undefined,
    abort(){
        if(this.responseFlag){
            return;
        }
        this.abortReqController.abort();
        console.log("abort");
        this.responseFlag = true;
        this.result = undefined;
        this.abortReqController = new AbortController();
        // this.abortReqSignal = abortReqController.signal;
    }
}
export async function _searchHandler(displayMode = "dropdown") {
    //function to call when searching (by varius methods like mouse, keyboard)
    if(!searchRequst.responseFlag) return;

    const searchValue = ui.options["search"].searchval.value;
    const searchBy = ui.options["search"].searchby.value;
    if (searchValue.search(/\w.*\w/) == -1) {
        //val has at least 2 alpha-numeric chars
        ui.coursesDropmenu.hide();
        return;
    }

    ui.coursesDropmenu.show();

    searchRequst.responseFlag = false;
    console.log("send: ",searchValue);

    try{
        var res = await processor.searchDatabase(searchValue, searchBy, searchRequst.abortReqSignal)
    }catch(err){
        if(err.message != "The user aborted a request.")
        console.error(err);
    }
    if(res){ //if no error
        searchRequst.responseFlag = true;
        searchRequst.result = res;

        console.log("recieve")
        if (res.courses.length < 1) {
            ui.coursesDropmenu.body.innerHTML = `<li class="dropdown-item">Nothing Found</li>`;
            return;
        }

        if(displayMode === "modal"){
            ui.updateModal(
                res.courses,
                "Found",
                "Add Courses",
                searchValue,
                searchBy
            );
            ui.cousresModal.submitFunction = function () {
                for (const course of ui.cousresModal.selected) {
                processor._addCourseFunction(course);
                }
            };
            ui.cousresModal.bootstrapModal.show();
        }
        else {
            const arr = res.courses.slice(0,10);
            for (const course of arr) {
                const courseCard = htmlCreator(
                "li", 
                ui.coursesDropmenu.body, "", 
                "dropdown-item btn", 
                `${course.name} | ${course.symbol}`
                );
                
                courseCard.addEventListener("click", ()=>{
                    ui.coursesDropmenu.hide();
                    const deepCopy = JSON.parse(JSON.stringify(course));
                    
                    processor._addCourseFunction(course);
                    ui.options["search"].searchval.value = "";
                });
            }
            const more = htmlCreator(
                "li", 
                ui.coursesDropmenu.body, "", 
                "dropdown-item btn text-primary", 
                `View all results (${res.num} results found)`
            );
            more.title = "View all results";
            more.addEventListener("click", ()=>{
                ui.updateModal(
                res.courses,
                "Found",
                "Add Courses",
                searchValue,
                searchBy
                );
                ui.cousresModal.submitFunction = function () {
                for (const course of ui.cousresModal.selected) {
                    processor._addCourseFunction(course);
                }
                };
                ui.cousresModal.bootstrapModal.show();
            });
        }
        
        console.log("num of results:",res.courses.length);
    }
}
export function _generateHandler(){

}
export function _addCourseHandler(){

}
export function _removeCourseHandler(){

}
export function _updateOptionsHandler(){

}


export function _changeActiveScheduleHandler(){

}
export function _nextScheduleHandler(){

}
export function _prevScheduleHandler(){

}
export function _deleteScheduleHandler(){
const id = activeTable.activeScheduleHandler.id;

table.allTable.deleteScheduleHandler(id);
table.pinnedTable.deleteScheduleHandler(id);

displayScheduleHandler();
}
export function _pinScheduleHandler(){

}
export function _unpinScheduleHandler(){

}
export function _printScheduleHandler(){

}
export function _pinnedScheduleHandler(){

}
export function _allScheduleHandler(){

}