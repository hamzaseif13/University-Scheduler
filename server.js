const express = require("express");

const app = express();

const PORT = 3000;

var handlebars = require("express3-handlebars").create({
    defaultLayout: "main",
});
app.engine("handlebars", handlebars.engine);
app.use(express.static(__dirname + "/public"));
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/generator", (req, res) => {
    res.render("generator");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});



app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
