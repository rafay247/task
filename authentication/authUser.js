const jwt = require('jsonwebtoken');
const JWT_SECRATE = process.env.JWT_SECRATE || "o16lab";

//here we make a middleware to fetch the user if user is authentic
const fetchUser = (req, res, next) => {

    token = req.header("auth-token");//get the auth-token value from the request header
    if (!token) {//if we cannt find any token error will occure
        req.user = { success: "false", auth: "false" };
    }
    else {
        try {
            const data = jwt.verify(token, JWT_SECRATE);//here we check/verify the token
            req.user = { success: "true", auth: "true", username: data.user };//store the user in req.user
        } catch (error) {
            req.user = { success: "false", auth: "false" };
        }
    }
    next();
}
module.exports = fetchUser;