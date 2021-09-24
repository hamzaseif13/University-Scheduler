const {Router}=require("express");
const authController=require("../controllers/authController")
const {requireAuth,checkUser}=require("../middlewares/authMiddleware")
const router=Router();
router.get("/signup",authController.signup_get);
router.post("/signup",authController.signup_post);
router.get("/login",authController.login_get);
router.post("/login",authController.login_post);
router.get("/logout",authController.logout_get);
router.post("/checkSettings",checkUser,authController.settings_post)
router.get("/settings",requireAuth,authController.settings_get)
module.exports=router;