const mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'cycle',
    insecureAuth : true
});

db.query('SELECT lastDate From Tracker WHERE RegID = ?','4500',(err,results)=>{
    if(err) throw err;
    lDate = new Date(results[0].lastDate);
    console.log('lDate: '+lDate);
    // DateLocale = new Date(lDate);
    // console.log(DateLocale);
    
    const addDays = (date, days)=>{
        let result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    
    const subDays = (date1,date2)=>{
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    }
    
    let currentDate = new Date();
    let startDate = lDate;
    let upComingDate = addDays(startDate, 28);
    let StCur = subDays(currentDate, startDate);
    let Length = 5;
    
    if (currentDate == upComingDate){
        startDate = upComingDate;
        upComingDate = addDays(upComingDate, 28);
    }
    
    let DayNum = 0;
    console.log('currentDate: '+currentDate);
    console.log('startDate: '+startDate);
    console.log('upComingDate: '+upComingDate);
    console.log('StCur: '+StCur);
    console.log('Length: '+Length);
    console.log('DayNum: '+DayNum);
    
    if (StCur <= Length) {
        DayNum = StCur;
        console.log("Period Day"+DayNum);
    }
    else {
        DayNum = subDays(currentDate,upComingDate);
        console.log("Period in" +DayNum+"Days");
    }
    
    console.log('currentDate: '+currentDate);
    console.log('startDate: '+startDate);
    console.log('upComingDate: '+upComingDate);
    console.log('StCur: '+StCur);
    console.log('Length: '+Length);
    console.log('DayNum: '+DayNum);
});