const User = require("../models/user");
const jwt =require("jsonwebtoken")
// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' ,name:""};
  if (err.message==="incorrect email"){
    errors.email="Please enter a valid email"
  }
  if (err.message==="incorrect password"){
    errors.email="The password is incorrect"
  }
  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }
  
  return errors;
}
//expiry time 3 days (seconds )
const maxAge=24*60*60*3
const createToken=(id)=>{
  return jwt.sign({id},"hamzaisverysmart",{expiresIn:maxAge})
}
// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.signup_post = async (req, res) => {
  const { email, password ,name} = req.body;

  try {
    const user = await User.create({ email, password ,name});
    const token=createToken(user._id);
    res.cookie("jwt",token,{httponly:true,maxAge:maxAge*1000})
    res.status(201).json({user:user._id});
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
 
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try{
    const user=await User.login(email,password);
    const token=createToken(user._id);
    res.cookie("jwt",token,{httponly:true,maxAge:maxAge*1000})
    res.status(200).json({user:user._id})
  }
  catch (err){
    const errors=handleErrors(err)
    res.status(401).json({errors})
  }
}
module.exports.logout_get=(req, res)=>{
  res.cookie("jwt","",{maxAge:1})
  res.redirect("/")
}