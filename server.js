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
    res.render("generator",{cs101:search("cs101","symbol")});
    
});
app.post("/getCourse/",async(req, res)=>{
    const searchObj = {};
    searchObj[req.body.searchBy] = {$regex:new RegExp(`^${req.body.value.trim()}.*`,"i")}
    let search = await Course.find(searchObj).exec();
    res.send({
        courses: search,//.slice(0,10), 
        num: search.length
    });
})
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/searchautofill",(req,res)=>{
    res.render("searchautofill")
})
app.get("/signup", (req, res) => {
    res.render("signup");
});
app.post("/gen",(req,res)=>{
let hamza = req.body.arr;
console.log(req.body.arr)
res.send({rec:"gtfo"})
})
app.post('/process',(req, res)=>{
   
   res.redirect("/tables")
})

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});