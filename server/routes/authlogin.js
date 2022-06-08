const express = require("express");
const passport = require("passport");
const prova = require("../middleware/middleprova");
const checkauth = require("../middleware/check-authenticate");
const mongoConn = require("../middleware/mongo-connection-user");
const route = express.Router();
const bodyParser = require("body-parser");
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config()



route.get("/google/",async (req, res, next) => {
    await passport.authenticate("google", { scope: ["email", "profile"] })(req, res, next)
    });

route.get("/google/callback",async (req, res, next) => {
   
  await passport.authenticate("google",  (err, user, info) => 
  {
      console.log(user)
    if(!err && user) {
        req.logIn(user, (err) => {
            
          res.send("<script>window.close();</script>");
            
          });
    }
    else
    res.send("<script>window.close();</script>");

  })(req, res, next)


});

route.get('/facebook', passport.authenticate('facebook', {
  scope: [ 'email']
}));


  route.get("/facebook/callback",async (req, res, next) => {
    await passport.authenticate("facebook",  (err, user, info) => 
    {
        console.log(user)
      if(!err && user) {
          req.logIn(user, (err) => {
              
              res.redirect(`${process.env.FRONT_END_SITE}/dashboard`);
              
            });
      }
      else
        res.redirect(`${process.env.FRONT_END_SITE}/login`)
  
    })(req, res, next)
  
  
  });




  route.get('/discord', passport.authenticate('discord'));



  route.get("/discord/callback",async (req, res, next) => {
    await passport.authenticate("discord",  (err, user, info) => 
    {
        console.log(user)
      if(!err && user) {
          req.logIn(user, (err) => {
              
              res.redirect(`${process.env.FRONT_END_SITE}/dashboard`);
              
            });
      }
      else
      res.redirect(`${process.env.FRONT_END_SITE}/login`)
  
    })(req, res, next)
  
  
  });



module.exports = route;
