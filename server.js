const express = require("express");
const authRoutes=require("./routes/authRoutes");
const app = express();
const mongoose = require('mongoose')
const generator=require("./logic/generator");
const {search, advancedSearch}=require("./db/Database");
const PORT = process.env.PORT||3000;
const Course=require("./models/course");
const cookieParser = require("cookie-parser")
const {requireAuth,checkUser}=require("./middlewares/authMiddleware")
const User=require("./models/user")
const Schedule=require("./models/scheduleModel")
//database connection
const dbUrl="mongodb+srv://hamzaseif:125369325147@unischedulercluster.fhjnr.mongodb.net/uniSchedulerDb?retryWrites=true&w=majority"
mongoose.connect(dbUrl,  { useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>console.log("db connected"))
    .catch((err)=>console.log(err))
app.set('view engine', 'ejs');
//middlewares and static files 
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended:true}))
app.use(express.json());

app.use(cookieParser());
//routes 
app.get('*',checkUser);
app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/generator", requireAuth,(req, res) => {
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

app.post("/gen",(req,res)=>{
    let generated=generator(req.body.arr,req.body.options)
    res.send({rec:generated});
})
app.post('/process',(req, res)=>{
   
   res.redirect("/tables")
})
app.post("/pin",checkUser,async(req,res)=>{
    
    const user =await User.findById(res.locals.user._id)
    

    
   
})
app.get("/pinned",(req,res)=>{
    res.render("pinned")
})
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
app.use(authRoutes)