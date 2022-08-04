const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const mysql = require('mysql');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'cycle',
    insecureAuth : true
});

var name1, email1, pass1, contact1, email2, pass2, personAge, isRegular, plength, lastPeriod, nextPeriod;
let session = false;

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

app.use((req,res,next)=>{
    if(req.url=='/login' || req.url=='/register' || req.url=='/'){
        return next();  
    } 
    if(session==true)next();
    else res.redirect('login');
});

app.set('view engine', 'ejs');

const addNewData = (name, mail, pass, cont)=>{
    let id = Math.floor(Math.random()*(9999-1000+1)+1000);
    let data = {RegID: id, Name: name, Email: mail, Password: pass, Contact: cont};
    let sql = 'INSERT INTO usertable SET ?';
    return new Promise((resolve, reject)=>{
        db.query(sql, data, (err, result)=>{
            if(err){reject(); throw err;}
            else{resolve();}
        });
    });
}

const upcomingThree = (m1)=>{
    let m2 = addDays(m1,28);
    let m3 = addDays(m2,28);
    const cycles = [m1, m2, m3];
    return cycles;
}

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

const mInfo = (Reg,QPLen,QLastp) => {
    let DayNum = 0;
    let currentDate = new Date();

    let startDate = new Date(QLastp);
    let upComingDate = addDays(startDate, 28);
    let remainingDays = subDays(startDate, currentDate);
    let Length = QPLen;
    let dayNumString = "";

    if (currentDate >= upComingDate) {
        startDate = upComingDate;

        db.query(`UPDATE tracker SET EstLastDate = '${startDate.toISOString().split('T')[0]}' WHERE RegID = '${Reg}'`,(err, result)=>{
            if(err) throw err;
            console.log('LastDate: '+result);
        });

        upComingDate = addDays(upComingDate, 28);
        remainingDays = subDays(startDate, currentDate);
    }

    if (remainingDays <= Length) {
        DayNum = remainingDays;
        dayNumString = "Period Day " + DayNum;
    }

    else {
        DayNum = subDays(currentDate, upComingDate);
        dayNumString = "Period in " + DayNum + " Days";
    }
    
    let monthThree = upcomingThree(startDate);
    upComingDate = upComingDate.toISOString().split('T')[0];
    const pInfo = {dayNumString, upComingDate, monthThree};
    return pInfo;
}

const authUser = (mail, pass) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM usertable WHERE Email = ?', mail, (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                if (pass != results[0].Password) {reject();}
                else { resolve();}
            }
            else{reject();}
        });
    });
}


// GET REQUEST FOR HOME PAGE
app.get('/',(req,res)=>{
    session = false;
    res.render('index');
});

// GET AND POST REQUESTS FOR SUCCESFULL REGISTRATION (SIGN UP BUTTON)

app.get('/register',(req,res)=>{
    res.render('register');
});

app.post('/register',(req,res)=>{
    name1 = req.body.name;
    email1 = req.body.email;
    pass1 = req.body.pass;
    contact1 = req.body.contact;
    addNewData(name1,email1,pass1,contact1)
    .then(()=>{
        res.render('success');
    })
    .catch(()=>{
        res.send('Invalid Credentials');
    })
});


// GET AND POST REQUESTS FOR SUCCESFULL LOGIN (SIGN IN BUTTON)

app.get('/login' , (req,res)=>{
    res.render('login');
});

app.post('/login',(req,res)=>{
    email2=req.body.email;
    pass2=req.body.pass;
    authUser(email2,pass2)
    .then(()=>{
        session = true;
        res.redirect('userIndex');
    })
    .catch(()=>res.send('Login Failed'));
});

app.get('/userIndex',(req, res)=>{
    db.query('SELECT Name FROM usertable WHERE Email = ?',email2,(err,results)=>{
        if(err) throw err;
        let userName = results[0].Name;
        res.render('userIndex',{userName});
    });
});


app.get('/track',(req, res)=>{
    db.query("SELECT RegID, flag FROM usertable WHERE Email = ?",email2,(err,results)=>{
        if(err) throw err;
        // console.log(results[0]);
        const flag = results[0].flag;
        const rID = results[0].RegID;
        if(flag=='Y'){
            db.query("SELECT * FROM tracker WHERE RegID = ?",rID,(err,results)=>{
                // console.log('track: '+results);
                const EstLastDate = results[0].EstLastDate;
                const pLength = results[0].pLength;
                const info = mInfo(rID, pLength, EstLastDate);
                let pInfo1 = info.dayNumString;
                let pInfo2 = info.upComingDate;
                let pInfo3 = info.monthThree;
                res.render('dashboard',{pInfo1,pInfo2,pInfo3});
            });
        }
        else{
            res.render('track');
        }
    });
});

app.post('/track',(req,res)=>{
    QpersonAge = req.body.age;
    QisReg = req.body.regular;
    Qplength = req.body.length;
    QlastPeriod = req.body.lpdate;

    let idQuery = 'SELECT RegID FROM usertable WHERE Email = ?';
    db.query(idQuery,email2,(err,result)=>{
        if(err) throw err;
        const QregID = result[0].RegID;
        let data = {
            RegID: QregID,
            Age: QpersonAge,
            isRegular: QisReg,
            pLength: Qplength,
            ActualLastDate: QlastPeriod,
            EstLastDate: QlastPeriod
        };
        
        db.query("INSERT INTO tracker SET ?",data,(err,result)=>{
            if(err) throw err;
            const info = mInfo(QregID, Qplength, QlastPeriod);
            let pInfo1 = info.dayNumString;
            let pInfo2 = info.upComingDate;
            let pInfo3 = info.monthThree;
            res.render('dashboard',{pInfo1,pInfo2,pInfo3});
        });

        db.query("UPDATE usertable SET flag = 'Y' WHERE RegID = ?", QregID, (err,result)=>{
            if(err) throw err;
            console.log('FlagUpdate: '+result);
        });
    });
});

app.get('/edit',(req,res)=>{
    res.render('edit');
});

app.post('/edit',(req,res)=>{

    QpersonAge = req.body.age;
    QisReg = req.body.regular;
    Qplength = req.body.length;
    QlastPeriod = req.body.lpdate;
    
    let idQuery = 'SELECT RegID FROM usertable WHERE Email = ?';
    db.query(idQuery,email2,(err,result)=>{
        if(err) throw err;
        const QregID = result[0].RegID;
        let data = [QpersonAge, QisReg, Qplength, QlastPeriod, QlastPeriod, QregID];

        db.query("UPDATE tracker SET Age = ?, isRegular = ?, pLength = ?, ActualLastDate = ?, EstLastDate = ? WHERE RegID = ?",data,(err,result)=>{
            if(err) throw err;
            const info = mInfo(QregID, Qplength, QlastPeriod);
            let pInfo1 = info.dayNumString;
            let pInfo2 = info.upComingDate;
            let pInfo3 = info.monthThree;
            res.render('dashboard',{pInfo1,pInfo2,pInfo3});
        });
    });
});

app.listen(PORT);
