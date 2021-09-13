const {Router}=require("express");
const pinController=require("../controllers/pinController")
const {requireAuth,checkUser}=require("../middlewares/authMiddleware")

const router=Router();

router.post("/pin",checkUser,pinController.pin_post)
module.exports=router;