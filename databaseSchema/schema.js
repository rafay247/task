const mysql = require('mysql');

const connection = process.env.connection || mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "testdb"
});

const connectToDb = () => {
    connection.connect(function (err) {
        if (err) {
            console.log(err.sqlMessage);
        }
        else {
            var sql = "CREATE TABLE IF NOT EXISTS deals ( dealId INT auto_increment primary key, Image BLOB, Discription  varchar(255), Category varchar(50), Price varchar(25), StartDate DATE, EndDate DATE)";
            connection.query(sql, function (err, result) {
                if (err)
                    console.log("not created d");
                else
                    console.log("Table Deals is created");
            });
            
            var sql = "CREATE TABLE IF NOT EXISTS Users ( userId INT auto_increment primary key, firstName varchar(50), lastName varchar(50), email varchar(50) unique , password varchar(255), token varchar(255))";
            connection.query(sql, function (err, result) {
                if (err)
                    console.log("not created u");
                else
                    console.log("Table users is created");
            });
        }
    });
}
module.exports = { connectToDb, connection };