const express = require("express");
const mongoose = require('mongoose')
const cookieParser = require("cookie-parser")
const {requireAuth,checkUser}=require("./middlewares/authMiddleware")
const app = express();
const bcrypt=require('bcrypt');

const PORT = process.env.PORT||3000;
const User= require("./models/user")
//routes
const authRoutes=require("./routes/authRoutes");
const pinRoutes=require("./routes/pinRoutes");
const genRoutes=require("./routes/genRoutes")
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
app.get("/settings",(req,res)=>{
    res.render("settings/settings")
})
app.post("/checkSettings",checkUser,async (req,res)=>{
    const user = res.locals.user
    const auth= await bcrypt.compare(req.body.oldPass,user.password)
    try{
        if(auth){
            if(req.body.newPass1==req.body.newPass2){
                if(req.body.newPass1.length<8)throw Error("Minimum password length is 8 characters")
                else{
                    console.log("pass matchs")
                    if(!req.body.name)throw Error("Enter a name please")
                    else user.name=req.body.name
                    user.password = req.body.newPass1;
                    user.save();
                    res.redirect("/home")
                }
            }
            else {
              throw Error('passwords dont match')
            }
          }
          else{
            throw Error("incorrect password")
          } 
    }catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
      }
    
})
app.use(authRoutes)
app.use(genRoutes)
app.use(pinRoutes)
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' ,name:""};
    if (err.message==="incorrect email"){
      errors.email="Please enter a valid email"
    }
    if (err.message==="incorrect password"){
      errors.password="The password is incorrect"
    }
   
    if(err.message==='passwords dont match'){
        errors.password='passwords dont match'
    }
    
    if(err.message==="Enter a name please"){
        errors.name="Enter a name please"
    }
    // duplicate email error
  
    // validation errors
    if (err.message.includes('user validation failed')) {
      // console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
        // console.log(val);
        // console.log(properties);
        errors[properties.path] = properties.message;
      });
    }
    if(err.message==="Minimum password length is 8 characters"){
        errors.password="Minimum password length is 8 characters"
    }
    return errors;
  }
