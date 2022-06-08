const express = require("express");
const chalk = require("chalk");
const passport = require("passport");
const prova = require("../middleware/middleprova");
const checkauth = require("../middleware/check-authenticate");
const dbConnection = require("../middleware/mongo-connection-user");
const HmacSHA256 = require("crypto-js").HmacSHA256;
const fetch = require("node-fetch");
const route = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios").default;
const authCheck = require("../middleware/authCheck")

require("dotenv").config();

const EVENTS_TO_SUB = ["channel.update", "stream.online", "stream.offline"];

route.use(bodyParser.urlencoded({ extended: true }));

const register = async (body) => {
  let userId = body;
  console.log(userId);
  if (userId) {
    userId = userId.id.toString();

    let url = process.env.SITE + "/api/eventsub/incoming";

    for (elem in EVENTS_TO_SUB) {
      let condition = {
        broadcaster_user_id: userId,
      };
      let opts = {
        method: "POST",
        headers: {
          "Client-ID": process.env.CLIENT_ID_TWITCH,
          Authorization: "Bearer " + process.env.TOKEN_TWITCH,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: EVENTS_TO_SUB[elem],
          version: "1",
          condition: condition,
          transport: {
            method: "webhook",
            callback: `${process.env.SITE}/api/eventsub/incoming`,
            secret: process.env.TWITCH_EVENTSUB_SECRET,
          },
        }),
      };

      let ex1 = new Promise((resolve, reject) => {
        resolve(fetch("https://api.twitch.tv/helix/eventsub/subscriptions", opts));
      });
    }
  }
};

const unsubprevious = async (old) => {
  let usalo = old.toString();
  let opts = {
    method: "GET",
    headers: {
      "Client-ID": process.env.CLIENT_ID_TWITCH,
      Authorization: "Bearer " + process.env.TOKEN_TWITCH,
      "Content-Type": "application/json",
    },
  };
  let list = [];
  let json, cursor;
  do {
    let url = "https://api.twitch.tv/helix/eventsub/subscriptions";
    if (cursor) {
      url += "?after=" + cursor;
    }
    let res = await fetch(url, opts);
    json = await res.json();
    if (res.status == 401) {
      this.logOAuthURL();
      return false;
    }
    list = list.concat(json.data);
    cursor = json.pagination?.cursor;
  } while (cursor != null);
  var newList = list.filter((e) => e.condition.broadcaster_user_id === usalo);

  console.log(newList);

  for (let i = 0; i < newList.length; i++) {
    const e = newList[i];

    console.log(chalk.red("Cleaning up previous EventSub"));
    let opts = {
      method: "DELETE",
      headers: {
        "Client-ID": process.env.CLIENT_ID_TWITCH,
        Authorization: "Bearer " + process.env.TOKEN_TWITCH,
        "Content-Type": "application/json",
      },
    };
    fetch("https://api.twitch.tv/helix/eventsub/subscriptions?id=" + e.id, opts).catch((error) => {
      console.log("EventSub Cleanup error for:", e.type);
    });
    //}
  }
};


let parsedEvents = {};
route.post("/incoming", async (req, res) => {
  let json = req.body;

  let id = req.headers["twitch-eventsub-message-id"];

  if (parsedEvents[id] === true) {
    console.log("Ignore", id);
    res.status(200); //Tell twitch to stop trying again and again and again and...
    return;
  }

  parsedEvents[id] = true;
  let sig = req.headers["twitch-eventsub-message-signature"];
  let ts = req.headers["twitch-eventsub-message-timestamp"];
  let hash = "sha256=" + HmacSHA256(id + ts + JSON.stringify(req.body), process.env.TWITCH_EVENTSUB_SECRET).toString();

  if (hash != sig) {
    console.log("Invalid signature challenge");
    res.sendStatus(403);
  } else {
    if (json.subscription.status == "webhook_callback_verification_pending") {
      console.log(chalk.blue("EventSub challenge completed for " + json.subscription.type));
      res.status(200).send(req.body.challenge);
    } else {
      console.log("incoming event type " + req.body.subscription.type+ " from broadcaster "+ req.body.event.broadcaster_user_id + " login name: "+ req.body.event.broadcaster_user_login);
       require('./triggers')(req.body)
      res.sendStatus(202);
    }
  }
});

route.get("/lista",authCheck, async (req, res) => {
  let opts = {
    method: "GET",
    headers: {
      "Client-ID": process.env.CLIENT_ID_TWITCH,
      Authorization: "Bearer " + process.env.TOKEN_TWITCH,
      "Content-Type": "application/json",
    },
  };
  let list = [];
  let json, cursor;
  do {
    let url = "https://api.twitch.tv/helix/eventsub/subscriptions";
    if (cursor) {
      url += "?after=" + cursor;
    }
    let res = await fetch(url, opts);
    json = await res.json();
    if (res.status == 401) {
      this.logOAuthURL();
      return false;
    }
    list = list.concat(json.data);
    cursor = json.pagination?.cursor;
  } while (cursor != null);
  console.log(list);
  res.sendStatus(200);

  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    //Cleaning up only callbacks containing "ngrok". Change that if not using ngrok.
    //You may want to simply disable this condition.
    //		if(e.transport.callback.indexOf("ngrok") > -1) {
    console.log(chalk.red("Cleaning up previous EventSub", e.id));
    let opts = {
      method: "DELETE",
      headers: {
        "Client-ID": process.env.CLIENT_ID_TWITCH,
        Authorization: "Bearer " + process.env.TOKEN_TWITCH,
        "Content-Type": "application/json",
      },
    };
    fetch("https://api.twitch.tv/helix/eventsub/subscriptions?id=" + e.id, opts).catch((error) => {
      console.log("EventSub Cleanup error for:", e.type);
    });
    //}
  }
});

module.exports = { route, register, unsubprevious };
