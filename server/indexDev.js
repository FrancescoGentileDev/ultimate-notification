const express = require("express");
const session = require("express-session");
const passport = require("passport");
var routerLogin = require("./routes/login.js");
var routerSignIn = require("./routes/sign.js");
var routerDashboard = require("./routes/dashboard");
var routeApi = require("./routes/routeApi");
const bodyParser = require("body-parser");
const routeGoogle = require('./routes/authlogin.js')
const routeAlexa = require('./routes/alexa.js')
require("dotenv").config();
var fs = require("fs");
var https = require("https");
var http = require("http");
const sgMail = require("@sendgrid/mail");

const app = express();

/*------MIDDLEWARE EXPRESS-------*/
app.use(
  session({
    secret: "chiavemomentanea",
    saveUninitialized: false,
    resave: false,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*------MIDDLEWARE PASSPORT-------*/

app.use(passport.initialize());
app.use(passport.session());
require("./middleware/passport-config")(passport);

/*------------ROUTES------------*/

app.use('/auth', routeGoogle)
app.use('/auth/login',routerLogin);
app.use('/sign', routerSignIn);
app.use('/api', routeApi.route)
app.use('/alexa', routeAlexa )
/*------HOME-------*/

app.get("/ciao", (req, res) => {
  res.send('ciao')
});

app.post("/auth/logout", (req, res) => {
  console.log("logout");
  req.logout();
  res.redirect("/login");
  console.log("logout = " + req.isAuthenticated());
});

app.listen(5000, () => {
  console.log("listen on 5000")
})

// https
// .createServer(
//   {
//     key: fs.readFileSync("key.pem"),
//     cert: fs.readFileSync("cert.pem"),
//   },
//   app
// )
// .listen(443, function () {
//   console.log(
//     "Example app listening on port 3000! Go to https://localhost:3000/"
//   );
// });
