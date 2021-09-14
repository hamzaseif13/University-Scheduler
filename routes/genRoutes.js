const {Router}= require("express");
const genController= require("../controllers/genController")

const router=Router();

router.get("/generator",genController.generator)
router.post("/gen",genController.gen)
router.post("/getCourse",genController.getCourse)

module.exports=router
