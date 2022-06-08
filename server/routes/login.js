const express= require('express');
const passport = require("passport");
const prova = require('../middleware/middleprova');
const checkauth = require('../middleware/check-authenticate');
const mongoConn = require('../middleware/mongo-connection-user');
const route = express.Router();
const bodyParser = require("body-parser");

route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));




route.get('/', (req,res) => {
    if(req.isAuthenticated()) return true;
    
    else return false;
})

route.get('/ciao', (req, res) => {
  res.send(' ciao come va ')
})
/*
route.post('/', 
passport.authenticate('local-login', {
  successRedirect: '/Dashboard',
  failureRedirect: '/',
  failureMessage: true }),(req,res) => {
    res.send(passport.Passport)
  });*/

route.post("/",  (req, res, next) => {
 passport.authenticate("local-login", (err, user, info) => {
    // console.log(info);
    if (err) throw err;
    
    if (!user) res.send({log: false, info: info});
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send({log: true, info: info});
        
      });
    }
  })(req, res, next);
});


route.get('/check', (req, res) => { 
  res.send( req.isAuthenticated());
  console.log(req.isAuthenticated())
})






module.exports= route;