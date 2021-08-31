const express = require("express");
const app = express();
const mongoose = require('mongoose')
const {search, advancedSearch}=require("./db/Database");
const PORT = 3000;
const Course=require("./models/course");
var handlebars = require("express3-handlebars").create({
    defaultLayout: "main",
});
//database connection
const dbUrl="mongodb+srv://hamzaseif:125369325147@unischedulercluster.fhjnr.mongodb.net/uniSchedulerDb?retryWrites=true&w=majority"
mongoose.connect(dbUrl, {autoIndex: false})
    .then(()=>console.log("db connected"))
    .catch((err)=>console.log(err))

//middlewares and static files 
app.set("view engine", "handlebars");
app.engine("handlebars", handlebars.engine);
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended:true}))
app.use(express.json());
//routes 

app.get("/", (req, res) => {
    
    res.render("landing");
});

app.get("/generator", (req, res) => {
    res.render("seatchautofill",{cs101:search("cs101","symbol")});
    
});
app.post("/getCourse",async(req, res)=>{
    let payload=req.body.courseName.trim();
   let search=await Course.find({"department":{$regex:new RegExp(`^`+payload+".*","i")}}).exec();
search=search.slice(0,10);
res.send({payload:search})

})
app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post('/process',(req, res)=>{
   
   res.redirect("/tables")
})

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
