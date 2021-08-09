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
    let generatedArray = cartesianProduct(...tempArray); //this array includes 15560 combinations
    
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

export default {
    courses: myCourses,
    _addCourseFunction,
    _removeCourseFunction,
    _searchFunction,
    _generateScheduleFunction
};