const express = require("express");
const app = express();
const mongoose = require('mongoose')
const generator=require("./logic/generator");
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
    const validProps = ["semester", "faculty", "department", "lineNumber", "symbol", "name"];
    let searchResult = [];
    const searchBy = req.body.searchBy;
    const value = req.body.value.trim();
    const searchRegex = {$regex:new RegExp(`^${value}.*`,"i")};

    if(validProps.includes(searchBy)){
        const searchObj = {};
        searchObj[searchBy] = searchRegex;
        searchResult = await Course.find(searchObj).exec();
    }
    else if(searchBy === "all"){
        const searchArr = [];
        for (const prop of validProps) {
            const obj = {};
            obj[prop] = searchRegex;

            searchArr.push(obj);
        }
        searchResult = await Course.find( { $or: searchArr } ).exec();
    }
    //{ $or: [ { status: "A" }, { qty: { $lt: 30 } } ] }
    
    res.send({
        courses: searchResult,//.slice(0,10), 
        num: searchResult.length
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
    let generated=generator(req.body.arr,req.body.options)
    res.send({rec:generated});
})
app.post('/process',(req, res)=>{
   
   res.redirect("/tables")
})

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
