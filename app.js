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

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

var name1, email1, pass1, contact1, email2, pass2, personAge, isRegular, plength, lastPeriod, nextPeriod;

// GET REQUEST FOR HOME PAGE
app.get('/',(req,res)=>{
    res.render('index');
});

// GET AND POST REQUESTS FOR SUCCESFULL REGISTRATION (SIGN UP BUTTON)

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

// GET AND POST REQUESTS FOR SUCCESFULL LOGIN (SIGN IN BUTTON)

app.get('/login' , (req,res)=>{
    res.render('login');
});

app.post('/login',(req,res)=>{
    email2=req.body.email;
    pass2=req.body.pass;
    authUser(email2,pass2)
    .then(()=>res.redirect('userIndex'))
    .catch(()=>res.send('Login Failed'));
});

app.get('/userIndex',(req, res)=>{
    // let userName = ""; 
    db.query('SELECT Name FROM usertable WHERE Email = ?',email2,(err,results)=>{
        if(err) throw err;
        let userName = results[0].Name;
        res.render('userIndex',{userName});
    });
});

app.get('/track',(req, res)=>{
    res.render('track');
});

const mInfo = (QPLen,QLastp) => {
    let DayNum = 0;
    let currentDate = new Date();

    let startDate = new Date(QLastp);
    let upComingDate = addDays(startDate, 28);
    let remainingDays = subDays(startDate, currentDate);
    let Length = QPLen;
    
    console.log('currentDate: '+currentDate);
    console.log('startDate: '+startDate);
    console.log('upComingDate: '+upComingDate);
    console.log('Remaining: '+remainingDays);
    console.log('Length: '+Length);
    console.log('DayNum: '+DayNum);

    if (currentDate >= upComingDate) {
        startDate = upComingDate;
        upComingDate = addDays(upComingDate, 28);
        //store in database
        console.log('startDate: '+startDate);
        console.log('upComingDate: '+upComingDate);
        remainingDays = subDays(startDate, currentDate);
    }

    if (remainingDays <= Length) {
        DayNum = remainingDays;
        console.log("Period Day" + DayNum);
    }

    else {
        DayNum = subDays(currentDate, upComingDate);
        console.log("Period in " + DayNum + " Days");
    }
}

app.post('/track',(req,res)=>{
    QpersonAge = req.body.age;
    QisReg = req.body.regular;
    Qplength = req.body.length;
    QlastPeriod = req.body.lpdate;
    // console.info(`Age: ${QpersonAge}, Reg: ${QisReg}, plen: ${Qplength}, lpdate: ${QlastPeriod}`);
    

    let idQuery = 'SELECT RegID FROM usertable WHERE Email = ?';
    db.query(idQuery,email2,(err,result)=>{
        if(err) throw err;
        let QregID = result[0].RegID;
        let data = {RegID: QregID, Age: QpersonAge, isRegular: QisReg, pLength : Qplength, lastDate: QlastPeriod};
        
        let sql = "INSERT INTO tracker SET ?";
        db.query(sql,data,(err,result)=>{
            if(err) throw err;
            res.send('SuccessFully Inserted');
            mInfo(Qplength, QlastPeriod);
        });
    });
});

app.listen(PORT,()=>{
    console.log(`Listening at ${PORT}`);
});  


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