

function calcScore(schedule, schoolDays){
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Sat"];
    const daysArr = {
        Sun:[],
        Mon:[],
        Tue:[],
        Wed:[],
        Thu:[],
        Sat:[]
    };  

    for(const day of weekDays){
        for(let sec of schedule){
            sec = sec[0];
            if(sec.days.includes(day))
                daysArr[day].push(sec);
        }
    }
    let identicalDays = true;
    let score = 0;
    let sumUniT = 0;
    let sumDays = 0;
    let uniTArr = [];
    for (const day of weekDays) {
        if(daysArr[day].length > 0){
            daysArr[day] = dayStats(daysArr[day]);
            score -= daysArr[day].studyPer*10;//better score if most of your school day is not free
            sumUniT += daysArr[day].uniT; // worse score for longer school days
            sumDays++;
            uniTArr.push(daysArr[day].uniT);
        }
        else
            score -= 10000; //better score for less days per week

        // if(!schoolDays.includes("all") && schoolDays.includes(day.toLowerCase())){
        //     if(identicalDays && daysArr[day].length === 0){
        //         identicalDays = false;
        //     }
        // }
    }
    //this make the score higher(worse) if the time spent in the university is very different between school days (high variance)
    let avg = sumUniT/sumDays;
    score += Math.sqrt(uniTArr.reduce((sum,val)=>{
        return sum + (val - avg)**2;
    },0)/sumDays);

    // if(!schoolDays.includes("all") && identicalDays)
    //     score -= 20000;//better score if the school days are exactly as inputed by user

    return ~~score;//round num
}
function dayStats(dayArr){
    // if(dayArr.length == 0)
    //     return 200;
    dayArr.sort((a,b)=>{
        return a.endTime - b.endTime;
    });

    const uniT = dayArr[dayArr.length - 1].endTime - dayArr[0].startTime;
    
    let studyT = 0;
    for (const sec of dayArr) {
        studyT += sec.endTime - sec.startTime;;
    }
    let obj = {uniT: uniT , studyPer: studyT/uniT * 100};
    // console.log(obj);
    return obj;
}

export default calcScore;