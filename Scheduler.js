import searchDatabase from "./Database.js";

const myCourses = [],
    schedule = [];

function courseIndex(courseNum) {
    //function to search the index of a course inside #myCourses
    return myCourses.findIndex((item) => {
      return item.lineNumber === courseNum;
    });
}
function _searchFunction(val, searchBy) {
  const result = searchDatabase(val, searchBy);
  return result;
}
function _addCourseFunction(courseNum) {
      //check if the course already exist
    if (courseIndex(courseNum) != -1)
      return ;

    const course = searchDatabase(courseNum);
    myCourses.push(...course);
}
function _removeCourseFunction(courseNum) {
    let index = courseIndex(courseNum);

    if (index != -1) myCourses.splice(index, 1);
}
function _generateScheduleFunction() {
    if(myCourses.length == 0)
        return [];
    let tempArray = []; 
    for (let j = 0; j < myCourses.length; j++) {
      tempArray.push(myCourses[j].sections);
    }
    let generatedArray = generateSchedules(...tempArray); //this array includes 15560 combinations
    
    return generatedArray;
}

function cartesianProduct(...paramArray) {//(...) => rest parameter (put all args in an array [paramArray])
    function addTo(curr, args) {
      let i, //always use let/const because they have better scoping (block scoping)
        copy,
        rest = args.slice(1),
        last = !rest.length,
        result = [];
  
      for (i = 0; i < args[0].length; i++) {
        copy = curr.slice();
        copy.push(args[0][i]);
  
        if (last) {
          result.push(copy);
        } else {
          result = result.concat(addTo(copy, rest));
        }
      }
  
      return result;
    }
  
    return addTo([], paramArray);
}
function generateSchedules(...sets){ //with loops instead of recursion
  const copy = [...sets];
  function addSet(mainSet,set){
    const arr = [];
    if(mainSet.length == 0)
      mainSet.push([]);
    for(const itemArr of mainSet){
      for (const item of set) {
        arr.push([...itemArr,item]);
      }
    }
    return arr;
  }
  function reduceSet(set){//sorts then put courses with the same time together (greatly reduce the number of combinations)
    const copy = [...set];
    const result = [];
    copy.sort((a,b)=>{
      return a.endTime - b.endTime;
    });
    for(let i=0;i<copy.length;){
      let item = copy[i];
      const arr = [];
      while(i<copy.length && item.endTime === copy[i].endTime){
        arr.push(copy[i]);
        i++;
      }
      result.push(arr);
    }
    return result;
  }
  let l=1;
  let result = [];
  for (const set of copy){
    result = addSet(result,reduceSet(set));
    l*=set.length;
  }
  console.log("Courses: ",sets.length, "\nnot reduced: ",l, "\nreduced: ",result.length)
  return result;
}

export default {
    courses: myCourses,
    _addCourseFunction,
    _removeCourseFunction,
    _searchFunction,
    _generateScheduleFunction
};