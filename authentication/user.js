const express = require('express');
const router = express.Router();
const { connection } = require('../databaseSchema/schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRATE = process.env.JWT_SECRATE || "o16lab";
const { body, validationResult } = require('express-validator');

//signup user using endpoint -> api/signup
router.post('/signup', [

    //ADD some express validation
    body('firstName', "enter firstName of min 3 character").isLength({ min: 3 }),
    body('lastName', "enter lastname of min 3 character").isLength({ min: 3 }),
    body('email', "email is required").notEmpty(),
    body('email', "entera valid email").isEmail(),
    body('password', "enter password of min 4 character").isLength({ min: 4 })
    //express validation end here
], async (req, res) => {

    let success = false;
    let flag = true;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        //IF any error occure in express validator then the 400 ERROR occure
        return res.status(400).json({ success, error: error.array() });
    }
    else {

        let errorMessage = "";
        //the main working to create user is here
        var salt = await bcrypt.genSalt(10);//make the salt for hash
        var password = await bcrypt.hash(req.body.password, salt);//make the hash of the password with salt

        await new Promise((resolve, reject) => {
            connection.connect(function (err) {
                //make a query to insert the user in database
                let query = `INSERT INTO users (firstName, lastName, email, password) VALUES ("${req.body.firstName}","${req.body.lastName}","${req.body.email}","${password}")`;
                //execute the query
                connection.query(query, function (err, result) {
                    if (err) {
                        flag = false;//the flag indicate that the error is occure
                        if (err.errno === 1062)
                            errorMessage = "The given email is already exist."
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                });
            })
        });

        if (flag) {
            const user = await new Promise((resolve, reject) => {
                var query = `SELECT * FROM users WHERE email = "${req.body.email}"`;
                connection.query(query, (err, result) => {
                    if (err)//if some error is occure then reject
                        reject(err)
                    else {//if some user get then resolve
                        resolve(result);
                    }
                });
            });
            let data = {//make the data to identify the user from their username
                email: user[0].email
            };
            const authToken = jwt.sign(data, JWT_SECRATE);//make the authtoken from JWT_SIGN function
            success = true;

            //save token in db
            await new Promise((resolve, reject) => {
                let query = `UPDATE users SET token = '${authToken}' WHERE email = '${data.email}'`;
                connection.query(query, function (err, result) {
                    if(err){
                        reject(err)
                    }
                    resolve(result)
                });
            });
            return res.status(200).json({ success, email: user[0].email, authToken });//return the authtoken that We made above
        }
        else {
            return res.status(400).json({ success, error: errorMessage });
        }
    }
});

//login user using endpoint -> api/login
router.post('/login',
    [
        body('email', "Enter a valid email").isEmail(),
        body('email', "Email is empty!!").notEmpty(),
        body('password', "enter password of min 3 character").notEmpty(),
        //express validation is complete here
    ],
    async (req, res) => {
        let success = false;
        //check the express validator
        const error = validationResult(req);

        if (!error.isEmpty()) {
            //if some error occure or user enter invlaid data then ERROR 400 occure
            return res.status(400).json({ success, error: error.array() });
        }

        else {
            const { email, password } = req.body;
            const user = await new Promise((resolve, reject) => {
                //make query to check the user
                let query = `SELECT * FROM users WHERE  email="${email}"`;//geting the data by email because we store the hash of the code
                connection.query(query, (err, result) => {
                    if (err) {
                        reject(err.message);//if any error will occure 
                    }
                    resolve(result);//response will return
                });
            });

            if (user.length != 0) {
                authPassword = await bcrypt.compare(password, data[0].password);//check the password with the user hash
                if (!authPassword) {//if the password is not compare with hash then error will occure
                    res.status(401).send({ success, error: "you have entered invalid credentials" });
                }
                else {
                    let data = {//make the user as json web token
                        user: user[0].email
                    };
                    authToken = jwt.sign(data, JWT_SECRATE);//assign a web token
                    success = true;

                    //save token in db
                    await new Promise((resolve, reject) => {
                        let query = `UPDATE users SET token = '${authToken}' WHERE email = '${data.email}'`;
                        connection.query(query, function (err, result) {
                            if(err){
                                reject(err)
                            }
                            resolve(result)
                        });
                    });
                    res.status(200).send({ success, email: user[0].email, authToken });//return the web-token
                }
            }
            else {
                res.status(200).send({ success, error: "invalid credentials" });
            }
        }
    });

module.exports = router;