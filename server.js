const express = require("express");
const app = express();
const mongoose = require('mongoose')
const {search}=require("./db/Database");
const PORT = 3000;
//const User=require("./models/user");
var handlebars = require("express3-handlebars").create({
    defaultLayout: "main",
});
//database connection
const dbUrl="mongodb+srv://hamzaseif:125369325147@unischedulercluster.fhjnr.mongodb.net/uniSchedulerDb?retryWrites=true&w=majority"
mongoose.connect(dbUrl)
    .then(()=>console.log("db connected"))
    .catch((err)=>console.log(err))

//middlewares and static files 
app.set("view engine", "handlebars");
app.engine("handlebars", handlebars.engine);
app.use(express.static(__dirname + "/public"));
console.log(search("cs101","symbol"))

//routes 
app.get("/", (req, res) => {
    res.render("landing",{time:"`11-12`",name:`"intro to programming"`});
});

app.get("/generator", (req, res) => {
    res.render("generator",{names:["hamza","mohammad"]});
    
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post('/process',(req, res)=>{
   console.log( req.body.subjects);
   res.redirect("/tables")
})

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
