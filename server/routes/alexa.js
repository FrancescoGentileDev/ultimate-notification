const express = require("express");
const passport = require("passport");
const prova = require("../middleware/middleprova");
const checkauth = require("../middleware/check-authenticate");
const mongoConn = require("../middleware/mongo-connection-user");
const route = express.Router();
const bodyParser = require("body-parser");
route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));
require("dotenv").config();

route.post("/return", mongoConn, (req, res) => {
  let code = req.body.code;
  req.alexaCollection
    .findOne({ login: code })
    .then((user) => {
      if (user) {
        var redirecturi = req.body.params.redirect_uri + `#access_token=${code}&token_type=token&state=` + req.body.params.state;
        res.send(redirecturi);
      } else res.send("400");
    })
    .then(() => {
      console.log("Connessione Chiusa");
      req.mongoClient.close();
    });
});
route.post("/insert", mongoConn, (req, res) => {
  if (req.body.data.userId) {
    console.log(req.body);
    req.alexaCollection.updateOne(
      {
        $and: [{ login: req.body.data.accessToken.toLowerCase() }, { sub: { $ne: req.body.data.userId } }],
      },
      { $push: { sub: req.body.data.userId } }
    );
  }

  res.sendStatus(200);
});

module.exports = route;

// ?client_id=AlexaRegistration&response_type=token&state=A2SAAEAEM-wnRkoPYOcgZ-wDoDoCUgCADMUiqX9k2J32iTHvbrTek07b4i-IWcI_P_q5aaQ1pw3f6D8zbbd5cHXFtA-nqvBp2-uY3dYs8iR5jbrQFtKT8yVv4s7hVVtnbarntnljTVWfXvm7pfAXaKzfVqFHxdJyekhEngwsK4wnvRctXL-v0lHchckgM1PaNitO-f_I0m1ydzsK7po_MTJ5_PW7n5hja4fjTHGjH1Uj3No040uNYZ3fMziUyj-gCs2oGKmJbsKt1fjqzUcmPZRW8STAUb0sPdptvt-Jp-5l4kBNw7Rsc0O-ngKWwua3uAHaZKZM-8Oh2NnTvewhN2lZFwXSt_H8h9-ycnIKmf2kRROJvVTZNX-_ED9JUa7qJO5uSpLKALepB6fdx59cjGoD6_8RFRhXt4b5Djj6GRk7XKgBjEHwbJuvj-vV1J8KBDI9rp6k2PYlmB8M7m3pZA0JhYNffNRJ83RyfhEt-O3dyTwiNAJFhHzcQpY1TdQRgECgRVW0pTjYeGLeTjKmbjq9x8Ipa37HuwlKSvc1yps1v7pTvWrzyN-PmLfxldjgo84pzBjkMp4ML--1L1VI4f175vgmc2eOfQj0DivsPWft3E9Nxykg-jW3CX1oqUShbff78VcWOO9tt42eW8PMbM51eVm9-LGPRQlB75V48WW7we4B5_HNT67VWBWVzmTnP65bkSAJsSm&redirect_uri=https%3A%2F%2Flayla.amazon.com%2Fspa%2Fskill%2Faccount-linking-status.html%3FvendorId%3DM2JQVRFFJ539CX
