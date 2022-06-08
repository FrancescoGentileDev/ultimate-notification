const express = require("express");
const passport = require("passport");
const prova = require("../middleware/middleprova");
const loginCheck = require("../middleware/loginCheck");
const dbConnection = require("../middleware/mongo-connection-user");
const authCheck = require("../middleware/authCheck");
const route = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios").default;
const { Telegraf } = require("telegraf");
var discordApi;
var eventsub = require("./eventsub");
require("dotenv").config();
const { MongoClient } = require("mongodb");
//DA TOGLIERE :

//TODO: AGGIUNGERE MIDDLEWARE CHE RICHIEDE DI ESSERE LOGGATO
let botTelegram = new Telegraf(process.env.TELEGRAM_TOKEN);
botTelegram
  .launch()
  .then((e) => {
    console.log("Bot telegram avviato");
    discordApi = require("./discord");
  })
  .then(() => {
    route.use("/eventsub", eventsub.route);
    route.use("/discord", discordApi.route);
  });

route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));
route.get("/sessionData", loginCheck, authCheck, (req, res) => {
  try {
    res.send(req.user.data);
  } catch {
    console.log("NOT CONNECTED");
    res.sendStatus(403);
  }
});

//#region  ---------------------------TWITCH----------------------------------------------
route.get("/getTwitchId", (req, res) => {
  opts = {
    params: {
      login: req.query.login,
    },

    headers: {
      Authorization: "Bearer " + process.env.TOKEN_TWITCH,
      "Client-Id": process.env.CLIENT_ID_TWITCH,
    },
  };

  axios
    .get("https://api.twitch.tv/helix/users", opts)
    .then((e) => {
      res.send(e.data.data[0].id);
    })
    .catch((e) => res.sendStatus(404));
});

route.post("/saveTwitchProfile", loginCheck, authCheck, dbConnection, (req, res) => {
  let exec = new Promise((resolve, reject) => {
    let query = { username: req.user.username };
    let opts = {
      $push: {
        "data.twitchId": {
          login: req.body.login,
          id: req.body.id,
          select: false,
        },
      },
    };
    req.userCollection.updateOne(query, opts, (err, ris) => {
      resolve(res.send("fine"));
    });
  })
    .then((e) => {
      console.log("Connessione Chiusa");
      req.mongoClient.close();
    })
    .catch((err) => {
      console.log("Connessione Chiusa con errore");
      req.mongoClient.close();
      res.sendStatus(303);
    });
});

route.post("/saveTwitchArray", loginCheck, authCheck, dbConnection, async (req, res) => {
  if (req.user) {
    var notent = false;
    var noOld = false;
    var newId;
    var oldId;

    if (req.user.data.selectProfile.twitch) oldId = req.user.data.selectProfile.twitch.id;
    else noOld = true;

    if (!req.body[0]) notent = true;
    else newId = req.body.find((e) => e.select === true);

    let exec = new Promise(async (resolve, reject) => {
      //await req.alexaCollection.updateOne({twitchId: newId.id}, {$set: {login : newId.login, sub: []}},{upsert: true})

      resolve(
        req.userCollection.updateOne(
          { username: req.user.username },
          {
            $set: { "data.twitchId": req.body, "data.selectProfile.twitch": newId },
          },
          { upsert: true }
        )
      );
    })
      .then(async (e) => {
        if (!noOld) {
          let cursor = await req.userCollection.find({ "data.selectProfile.twitch.id": oldId });

          if ((await cursor.count()) === 0)
            // await req.alexaCollection.deleteOne({twitchId: oldId})
            // .then((e)=> {
            console.log(oldId);
          eventsub.unsubprevious(oldId);
          // })
        }

        if (!notent) eventsub.register(newId);

        console.log("Connessione Chiusa");
        req.mongoClient.close();
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log("Connessione Chiusa con errore");
        req.mongoClient.close();
        res.sendStatus(303);
      });
  }
});
//#endregion

//#region ---------------------------TELEGRAM----------------------------------------------
route.get("/telegram/checkTelegram", loginCheck, authCheck, async (req, res) => {
  botTelegram.telegram
    .getChatAdministrators("@" + req.query.name)
    .then((e) => {
      if (e[0].can_post_messages && e[0].can_edit_messages && e[0].can_delete_messages && e.findIndex((e) => e.user.id === req.user.data.telegram.userId) !== -1) {
        botTelegram.telegram.getChat("@" + req.query.name).then((chat) => {
          res.send({ ok: true, description: chat.id });
        });
      } else {
        res.send({ ok: false, description: "Permission Missing" });
      }
    })

    .catch((e) => {
      res.send({ ok: false, description: "Channel not Found" });
    });
});

route.post("/telegram/savetelegram", loginCheck, authCheck, dbConnection, (req, res) => {
  var newId = req.body.data.find((e) => e.select === true);

  let exec = new Promise((resolve, reject) => {
    resolve(req.userCollection.updateOne({ username: req.user.username }, { $set: { "data.telegram.IdList": req.body.data, "data.selectProfile.telegram": newId } }));
  })
    .then((e) => {
      console.log("Connessione Chiusa");
      req.mongoClient.close();
    })
    .catch((err) => {
      console.log("Connessione Chiusa con errore");
      req.mongoClient.close();
      res.sendStatus(303);
    });
});

route.post("/telegram/preview", loginCheck, authCheck, (req, res) => {
  let params = req.body.switch;
  let phrase = req.body.phrase;
  let link = req.body.link;
  let twitchArr = req.user.data.twitchId;
  let idUtenteTelegram = req.user.data.telegram.userId;

  let val = {
    image: "",
    title: "",
    game: "",
    time: "",
  };

  let pos = req.body.pos;

  for (const elem in params) {
    if (params[elem] && elem !== "Enabled") {
      if (elem === "Image") val.image = "https://static-cdn.jtvnw.net/ttv-boxart/516575-600x800.jpg";
      else if (elem === "Title") val.title = "\n📌: Today we play VALORANT RANKED";
      else if (elem === "Game") val.game = "\n🎮: VALORANT";
      else if (elem === "Time") {
        val.time = "\n⏳ Started: 21:30";
        if (pos === "end") val.time += "\n⌛ Ended: 00:00";
      }
    }
  }

  let twitchChan;
  twitchArr.map((e) => {
    if (e.select) twitchChan = e.login;
  });

  if (params.Image) {
    pos = {
      photo: val.image,
      caption: "<b>" + phrase + "\n" + "<i>" + val.title + "</i>" + val.game + val.time + "</b>",
      reply_markup: {
        inline_keyboard: [[{ text: link, url: "https://www.twitch.tv/" + twitchChan }]],
      },
      parse_mode: "HTML",
    };

    botTelegram.telegram.sendPhoto(idUtenteTelegram, "", pos).then(() => {
      res.sendStatus(200);
    });
  } else {
    let text = "<b>" + phrase + "\n" + "<i>" + val.title + "</i>" + val.game + val.time + "</b>";

    pos = {
      reply_markup: {
        inline_keyboard: [[{ text: link, url: "https://www.twitch.tv/" + twitchChan }]],
      },
      parse_mode: "HTML",
    };
    botTelegram.telegram
      .sendMessage(idUtenteTelegram, text, pos)
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        res.send("sei stronzo");
      });
  }
});

//------------------------RISPOSTE PRIVATE BOT--------------------------------------//
botTelegram.start(async (e) => {
  if (e.startPayload) {
    var mongoClient;

    let ex = new Promise((resolve, reject) => {
      console.log("Connessione avvenuta");
      mongoClient = new MongoClient(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
      resolve(mongoClient.connect());
      return mongoClient;
    })
      .then((db) => {
        return db
          .db("Utenti")
          .collection("user")
          .updateOne({ "data.telegram.uniquecode": e.startPayload }, { $set: { "data.telegram.userId": e.chat.id } });
      })
      .then((ris) => {
        if (ris.matchedCount !== 0) e.reply("Hi!👋 I'm ready! now you can invite me in your channel 😊");
        else e.reply(" Something is wrong retry by click link on website");
      })
      .then(() => {
        console.log("Connessione Chiusa");
        mongoClient.close();
      });
  } else e.reply("mmmh🤔, are you sure you have clicked on the button of our site to connect telegram? Retry please  . I wait you 😘");
});
//#endregion

//#region TWITCH TOKEN
function createTwitchToken() {
  axios
    .post("https://id.twitch.tv/oauth2/token?client_id=" + process.env.CLIENT_ID_TWITCH + "&client_secret=" + process.env.SECRET_TWITCH + "&grant_type=client_credentials")
    .then((e) => {
      console.log("Token created successfully");
      // console.log(e.data.access_token)
      process.env.TOKEN_TWITCH = e.data.access_token;
      console.log(e.data.access_token);
    })
    .catch((e) => console.log("ERRORE CREAZIONE TOKEN TWITCH"));
}
createTwitchToken();
setInterval(createTwitchToken, 3600000);
//#endregion

route.post("/checkedChange", loginCheck, authCheck, dbConnection, (req, res) => {
  let string = "data." + req.body.target + ".checked";
  let ex = new Promise((resolve) => {
    resolve(req.userCollection.updateOne({ username: req.user.username }, { $set: { [string]: req.body.value } }));
  }).then(() => {
    req.mongoClient.close();
    console.log("Connessione Chiusa");
    res.sendStatus(200);
  });
});

route.post("/saveNot", loginCheck, authCheck, dbConnection, (req, res) => {
  let string = "data." + req.body.con + "." + req.body.pos;
  let ex = new Promise((resolve, reject) => {
    resolve(req.userCollection.updateOne({ username: req.user.username }, { $set: { [string]: req.body.not } }));
  }).then(() => {
    req.mongoClient.close();
    console.log("Connessione Chiusa");
    res.sendStatus(200);
  });
});

route.get("/mailconfirmation", dbConnection, async (req, res) => {
  let code = req.query.code;
  console.log(code);
  if (code) await req.userCollection.findOneAndUpdate({ tempcode: code }, { $set: { enabled: true } });
  res.redirect(`${process.env.FRONT_END_SITE}/login`);
});

route.post("/settimezone", loginCheck, authCheck, dbConnection, (req, res) => {
  if (req.user) {
    req.userCollection.updateOne({ username: req.user.username }, { $set: { "data.tempvar.timezone": req.body.data } }, (err, result) => {
      req.mongoClient.close();
    });

    console.log(req.body.data);
  }
});

module.exports = { route, createTwitchToken, botTelegram };
