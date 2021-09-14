const {Router}=require("express");
const pinController=require("../controllers/pinController")
const {requireAuth,checkUser}=require("../middlewares/authMiddleware")

const router=Router();

router.post("/pin",checkUser,pinController.pin_post)
router.delete("/unpin",checkUser,pinController.unpin_delete)

module.exports=router;