
function filterHTML(html){
  if(html.search(/semester/igm) < 20)//check if input is filtered
      return html;
  const arabicLetter =
    "[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]";
  let tmp, arr, semester, facultyName, departmentName;
    tmp = html.replace(
      new RegExp(`(?<=\\w|${arabicLetter}) (?=\\w|${arabicLetter})`, "gm"),
      "@@"
    ); //mark spaces between words
  tmp = tmp.replace(/\s+/gm, ""); //remove extra spaces
  tmp = tmp.replace(/@@/g, " "); //return spaces between words
  tmp = tmp.replace(/selected="selected"/gim, ">@@@<"); //mark selected semester,faculty,department,view
  tmp = tmp.replace(/<br.?>/gm, "@");//mark breaks inside table
  tmp = tmp.replace(/<.*?>/gm, "~"); //replace all html tags with [~]
  tmp = tmp.replace(/[~]+/gm, "|"); //replace multi [~] with |
  tmp = tmp.replace(/:/gm, "").replace(/&amp;/g, " & "); //remove [:] and add [&]
    
  arr = [...tmp.matchAll(/(?<=@@@[|]).*?(?=[|])/gm)];
  semester = arr[0][0];
  facultyName = arr[1][0];
  departmentName = arr[2][0];

  tmp = tmp.replace(/@[|]|[|]@/gm,"|");//remove unwanted [@] in the start and end of the data item
  tmp = tmp.replace(/.*?line number/i, "Line Number"); //remove everything before the first course(Line number)

  tmp = semester+"|"+facultyName+"|"+departmentName+"|"+tmp;

  return tmp;
}

let c = document.querySelector("table.gvSchedule");
if(c != null){

    let text = document.body.innerHTML;
    text = filterHTML(text);
    text = `HTMLData.push(\`${text}\`);\n`;
    //text = text.replace(/[|]/gm,"|\n");

    navigator.clipboard.writeText(text).then(function() {
        /* clipboard successfully set */
      }, function() {
        alert("copy failed");
        console.log(text);
      });

}
