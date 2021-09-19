const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt=require('bcrypt');

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "", name: "" };
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }
  if (err.message === "incorrect email") {
    errors.email = "Please enter a valid email";
    return errors;
  }
  if (err.message === "incorrect password") {
    errors.password = "The password is incorrect";
  }

  if (err.message === "passwords dont match") {
    errors.password = "passwords dont match";
  }

  if (err.message === "Enter a name please") {
    errors.name = "Enter a name please";
  }
  // duplicate email error

  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }
  if (err.message === "Minimum password length is 8 characters") {
    errors.password = "Minimum password length is 8 characters";
  }
  return errors;
};
//expiry time 3 days (seconds )
const maxAge = 24 * 60 * 60 * 3;
const createToken = (id) => {
  return jwt.sign({ id }, "hamzaisverysmart", { expiresIn: maxAge });
};
// controller actions
module.exports.signup_get = (req, res) => {
  if (res.locals.user) res.redirect("/");
  else {
    res.render("signup");
  }
};

module.exports.login_get = (req, res) => {
  if (res.locals.user) res.redirect("/");
  else res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const user = await User.create({ email, password, name });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httponly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httponly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(401).json({ errors });
  }
};
module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
module.exports.settings = async (req, res) => {
  const user = res.locals.user;
  try {
    if (!req.body.newPass1 && !req.body.newPass2 && !req.body.oldPass) {
      if (!req.body.name) throw Error("Enter a name please");
      else {
        user.name = req.body.name;
        user.save();
        res.json({ pass: "true" });
      }
    } else {
      const auth = await bcrypt.compare(req.body.oldPass, user.password);
      if (auth) {
        if (req.body.newPass1 != req.body.newPass2)
          throw Error("passwords dont match");
        else if (req.body.newPass1.length < 8 || req.body.newPass2.length < 8)
          throw Error("Minimum password length is 8 characters");
        else {
          user.password = req.body.newPass1;
          user.save();
          res.json({ pass: "true" });
        }
      } else {
        throw Error("incorrect password");
      }
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

