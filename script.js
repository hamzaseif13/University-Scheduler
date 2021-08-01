class Course {
  constructor(Name, LineNumber,CreditHours) {
    this.creditHours=CreditHours;
    this.name = Name;
    this.lineNumber = LineNumber;
  }
}

class Section extends Course {
  constructor(Name,LineNumber,CreditHours,sNumber, Days,Time,Hall, Capacity, Registered, Instructor ) {
    super(Name, LineNumber,CreditHours);

    this.sectionNumber = sNumber;
    this.days = Days;
    this.time = Time;
    this.hall = Hall;
    this.capacity = Capacity;
    this.registered = Registered;
    this.instructor = Instructor;
  }
}
/*
var Se230 = new Section("FUNDAMENTALS OF SOFTWARE ENGINEERING",1762300,3,1,"Sun Mon Tue Wed","10:00-11:30","online", 35, 35,"خلدون طارق احمد الزعبي	"
);

var courseTable = document.createElement("table");
courseTable.className="table table-hover"
courseTable.innerHTML = `<tr>
<td>Credit Hours</td>

<td>Name</td>
<td>Line number</td>
<td>Section</td>
<td>Days</td>
<td>Time</td>
<td>Hall</td>
<td>Capacity</td>
<td>Registred</td>
<td>Instructor</td>

</tr>
<tr>
<td>${Se230.creditHours}</td>
<td>${Se230.name}</td>
<td>${Se230.lineNumber}</td>
<td>${Se230.sectionNumber}</td>
<td>${Se230.days}</td>
<td>${Se230.time}</td>
<td>${Se230.hall}</td>
<td>${Se230.capacity}</td>
<td>${Se230.registered}</td>
<td>${Se230.instructor}</td>
</tr>`;
document.body.appendChild(courseTable);*/
