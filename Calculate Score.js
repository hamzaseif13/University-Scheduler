

function calcScore(schedule){
    const days = ["sun", "mon", "tue", "wed", "thu", "sat"];
    const daysArr = {
        sun:[],
        mon:[],
        tue:[],
        wed:[],
        thu:[],
        sat:[]
    };  

    for(const day of days){
        for(let sec of schedule){
            sec = sec[0];
            if(sec.days.toLowerCase().includes(day))
                daysArr[day].push(sec);
        }
    }
    let score = 0;
    for (const day in daysArr) {
        score += dayScore(daysArr[day]);
    }

    // console.log(score,daysArr);
    return score;
}
function dayScore(dayArr){
    if(dayArr.length < 2)
        return 0;
    dayArr.sort((a,b)=>{
        return a.endTime - b.endTime;
    });
    let score = 0;
    for (let i = 1; i < dayArr.length; i++) {
        score += dayArr[i].startTime - dayArr[i-1].endTime;
    }
    return score;
}

export default calcScore;