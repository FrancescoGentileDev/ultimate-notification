const express = require('express');
const session = require('cookie-session');
const passport = require('passport');
var routerLogin= require('./routes/login.js');
var routerSignIn= require('./routes/sign.js');
var routerDashboard= require('./routes/dashboard');
var routeApi = require('./routes/routeApi')
const bodyParser = require("body-parser");
const routeGoogle = require('./routes/authlogin.js')
const routeAlexa = require('./routes/alexa.js')
var favicon = require('serve-favicon')
var fs = require("fs");
var https = require("https");
var http = require("http");
const app = express();
require('dotenv').config()
const path= require("path")




app.use(express.static(path.join(__dirname,'landing')))
app.use(express.static(path.join(__dirname,'build')))

/*------MIDDLEWARE EXPRESS-------*/
app.use(session({
    secret: process.env.SESSION_KEY,
    saveUninitialized: true,
    resave: false
    
}));
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'landing', 'index.html'));
})
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname,'landing', 'index.html'));
})
app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname,'landing', 'index.html'));
})

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname,'build', 'index.html'));
})

app.post('/auth/logout', (req,res) => {
  console.log('logout')
  req.logout()
 res.redirect('/login')
  console.log('logout = ' + req.isAuthenticated())
});








http.createServer(app).listen(process.env.PORT ||80, () => {
  console.log('listening on 80')
})

// const options = {
//   key: fs.readFileSync('server.pem'),
//   cert: fs.readFileSync('server.crt')
// };

// https.createServer(options, app).listen(443);


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
