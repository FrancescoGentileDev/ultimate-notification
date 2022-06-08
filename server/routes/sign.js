const express= require('express');
const dbConnection = require('../middleware/mongo-connection-user');
const middlsign = require('../middleware/sign-middle');
const res = require('express/lib/response');
const route = express.Router();
const authCheck = require("../middleware/authCheck")
const bodyParser = require("body-parser");

route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));




 route.post('/api/register',authCheck, dbConnection, middlsign.validation, middlsign.insetuser, async (req,res) => {
  console.log("Connessione Chiusa");
  req.mongoClient.close();

   console.log(req.error)
        if(!req.error)
        res.send('202');
        else
        res.send('303')
});

route.get('/api/getEmail',authCheck, dbConnection, async (req,res) => {
      const mail= new Promise((resolve,rej) => {
        
          resolve(req.userCollection.findOne({ email:req.query.email.toLowerCase()}))
         
       
      })
      .then(user => {
        
       if(user===null)
        res.send(true)
       else
        res.send(false)
      })
      .then(() => {
        console.log("Connessione Chiusa");
        req.mongoClient.close()
      })
      .catch(e => res.send(e))
        
})
route.get('/api/getUsername',authCheck, dbConnection, async (req,res) => {
      const mail= new Promise((resolve,rej) => {
       
          resolve(req.userCollection.findOne({ username: req.query.username.toLowerCase()}))
      
         
      })
      .then(user => {
        
       if(user===null)
        res.send(true)
       else
        res.send(false)
      })
      .then(() => {
        console.log("Connessione Chiusa");
        req.mongoClient.close()
      })
      .catch(e => res.send(e))
        
})



module.exports= route;