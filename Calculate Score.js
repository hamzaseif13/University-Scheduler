

function calcScore(schedule){
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Sat"];
    const daysArr = {
        Sun:[],
        Mon:[],
        Tue:[],
        Wed:[],
        Thu:[],
        Sat:[]
    };  

    for(const day of days){
        for(let sec of schedule){
            sec = sec[0];
            if(sec.days.includes(day))
                daysArr[day].push(sec);
        }
    }
    let score = 0;
    let sumUniT = 0;
    let sumDays = 0
    let arr = []
    for (const day in daysArr) {
        if(daysArr[day].length > 0){
            daysArr[day] = dayStats(daysArr[day]);
            score -= daysArr[day].studyPer*10;
            sumUniT += daysArr[day].uniT;
            sumDays++;
            arr.push(daysArr[day].uniT);
        }
        else
            score -= 10000;
    }

    let avg = sumUniT/sumDays;
    score += Math.sqrt(arr.reduce((sum,val)=>{
        return sum + (val - avg)**2
    },0)/sumDays);
    // console.log(score);
    return ~~score;
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