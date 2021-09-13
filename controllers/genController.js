const Course=require('../models/course');


module.exports.generator=(req,res)=>{
    res.render("generator")
}
module.exports.getCourse=async(req, res)=>{
    const validProps = ["semester", "faculty", "department", "lineNumber", "symbol", "name"];
    let searchResult = [];
    const searchBy = req.body.searchBy;
    const value = req.body.value.trim();
    const searchRegex = {$regex:new RegExp(`^${value}.*`,"i")};

    if(validProps.includes(searchBy)){
        const searchObj = {};
        searchObj[searchBy] = searchRegex;
        searchResult = await Course.find(searchObj).exec();
    }
    else if(searchBy === "all"){
        const searchArr = [];
        for (const prop of validProps) {
            const obj = {};
            obj[prop] = searchRegex;

            searchArr.push(obj);
        }
        searchResult = await Course.find( { $or: searchArr } ).exec();
    }
    //{ $or: [ { status: "A" }, { qty: { $lt: 30 } } ] }
    
    res.send({
        courses: searchResult,//.slice(0,10), 
        num: searchResult.length
    });
}
module.exports.gen=(req,res)=>{
    let generated=generator(req.body.arr,req.body.options)
    res.send({rec:generated});
}