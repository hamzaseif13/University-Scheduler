const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require("./middlewares/authMiddleware");
const app = express();
const Course = require("./models/course");
const PORT = process.env.PORT || 3000;
//routes
const authRoutes = require("./routes/authRoutes");
const pinRoutes = require("./routes/pinRoutes");
const genRoutes = require("./routes/genRoutes");
const {search}=require("./db/Database")
//database connection
const dbUrl =
  "mongodb+srv://hamzaseif:125369325147@unischedulercluster.fhjnr.mongodb.net/uniSchedulerDb?retryWrites=true&w=majority";
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));
app.set("view engine", "ejs");
//middlewares and static files
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
//routes
app.get("*", checkUser);
app.get("/", (req, res) => {
 
  res.render("landing");
});
app.get("/pinned",(req, res)=>{
    res.render("pinned")
})

app.use(authRoutes);
app.use(genRoutes);
app.use(pinRoutes);
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
