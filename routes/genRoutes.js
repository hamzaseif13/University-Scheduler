const {Router}= require("express");
const genController= require("../controllers/genController")

const router=Router();

router.get("/generator",genController.generator_get)
router.post("/gen",genController.generator_post)
router.post("/getCourse",genController.getCourse_post)

module.exports=router
