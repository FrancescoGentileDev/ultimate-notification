const express= require('express');
const dbConnection = require('../middleware/mongo-connection-user');
const checkauth = require("../middleware/check-authenticate");
const passport = require('passport');
const mongoConn = require('../middleware/mongo-connection-user');
const route = express.Router();
route.use(express.urlencoded({extended: true}));
route.use(express.static('views'));


route.get('/', checkauth(), async (req,res) => {
    
    console.log(req.user.data.messaggio);
    res.render('dashboard', {messuser: req.user.data.messaggio});
})

 route.post('/',mongoConn, async (req,res) => {
    if(!req.isAuthenticated()) return res.redirect('/login')
    await req.userCollection.updateOne({username: req.user.username}, {$set: {data: {messaggio: req.body.scrivi}}})
    await  res.render('dashboard', {messuser: req.body.scrivi})
     console.log("Connessione Chiusa");
      req.mongoClient.close();

});






module.exports= route;