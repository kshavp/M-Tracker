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

app.listen(PORT);

const addDays = (date, days)=>{
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const upcomingThree = (m1) =>{
    let m2 = addDays(m1,28);
    let m3 = addDays(m2,28);
    const cycles = [m1, m2.toISOString().split('T')[0], m3.toISOString().split('T')[0]];
    console.log(cycles);
};

let date1 = '2022/06/25';

upcomingThree(date1);

