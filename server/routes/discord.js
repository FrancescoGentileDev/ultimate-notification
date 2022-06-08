const express = require("express");
const passport = require("passport");
const prova = require("../middleware/middleprova");
const authCheck = require("../middleware/authCheck");
const dbConnection = require("../middleware/mongo-connection-user");
const loginCheck = require("../middleware/loginCheck");
require("dotenv").config();
const route = express.Router();

const bodyParser = require("body-parser");
const axios = require("axios").default;
const {
  Client,
  Intents,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const botDiscord = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES],
});

//https://discord.com/api/oauth2/authorize?client_id=950791583299678279&permissions=274878168080&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fdiscord%2Fregistration&response_type=code&scope=identify%20bot
route.use(bodyParser.urlencoded({ extended: true }));

botDiscord.login(process.env.DISCORD_BOT_TOKEN).then(() => {
  console.log("Bot Discord Avviato");
}).then(() => {require('./triggers.js')})

route.get("/registration", dbConnection, (req, res) => {
  if (req.user) {
    const params = new URLSearchParams();
    params.append("client_id", process.env.DISCORD_CLIENT_ID);
    params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", req.query.code);
    params.append(
      "redirect_uri",
      `${process.env.SITE}/api/discord/registration`
    );

    axios
      .post("https://discord.com/api/oauth2/token", params)
      .then((e) => {
        //#region
        if(e.status===401)
            {
              res.redirect('/dashboard')
              res.sendStatus(401)
            }
        axios
          .get("https://discordapp.com/api/users/@me", {
            headers: { Authorization: `Bearer ${e.data.access_token}` },
          })
          .then((response) => {
           
            req.userCollection.updateOne(
              { username: req.user.username },
              { $set: { "data.discord.userId": response.data.id } }
            );
            return e.data.guild.id;
          })
          .then((guild) => {
            axios
              .get(`https://discord.com/api/guilds/${guild}/channels`, {
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                },
              })
              .then((channels) => {
                if(channels.status===401)
                {
                  res.redirect('/dashboard')
                  res.sendStatus(401)
                }
                let filt = channels.data.filter(
                  (ch) =>
                    ch.type === 0 ||
                    ch.type === 5 ||
                    ch.type === 10 ||
                    ch.type === 11
                );
                let rid = filt.map((ch) => {
                  return { id: ch.id, name: ch.name, select: false };
                });

                let gilda = {
                  guild: guild,
                  channels: rid,
                };

                console.log(rid);

                req.userCollection
                  .updateOne(
                    { username: req.user.username },
                    { $set: { "data.discord.idList": gilda } }
                  )
                  .then(() => {
                    console.log("Connessione Chiusa");
                    req.mongoClient.close();
                  })
                  .then(() => {
                    res.redirect(
                      `${process.env.FRONT_END_SITE}/dashboard/settings`
                    );
                  });
              })
              .catch((err) => {
                console.log("ERRORE RECUPERO CHANNEL")
                console.log(err);
              });
          }).catch((e) => {
            console.log("ERRORE RECUPERO DATI")
            console.log(e); 
            res.redirect('/dashboard/settings');
           
           
          })
          
      })
      .catch((e) => {
        console.log("ERRORE CREAZIONE TOKEN")
        console.log(e);
      });
    //#endregion
  } else res.redirect(`${process.env.FRONT_END_SITE}/`);
});

route.post("/saveDiscord",loginCheck,authCheck, dbConnection, (req, res) => {
  var newId = req.body.find(e=> e.select===true)
  let exec = new Promise((resolve, reject) => {
    resolve(
      req.userCollection.updateOne(
        { username: req.user.username },
        { $set: { "data.discord.idList.channels": req.body,
                  "data.selectProfile.discord": newId } }
      )
    );
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

route.get("/userId",loginCheck,authCheck, (req, res) => {
  const params = new URLSearchParams();
  params.append("client_id", process.env.DISCORD_CLIENT_ID);
  params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", req.query.code);
  params.append("redirect_uri", `${process.env.SITE}/api/discord/userId`);

  axios
    .post("https://discord.com/api/oauth2/token", params)
    .then((e) => {
      axios
        .get("https://discordapp.com/api/users/@me", {
          headers: { Authorization: `Bearer ${e.data.access_token}` },
        })
        .then((response) => {
          console.log(response.data);
        });
    })
    .then((response) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
    });
});

route.post("/preview",loginCheck, authCheck, (req, res) => {
  let params = req.body.switch;
  let phrase = req.body.phrase;
  let link = req.body.link;
  let color = req.body.color ;
  let twitchArr = req.user.data.twitchId;
  let idUtenteDiscord = req.user.data.discord.userId;
  let val = {
    image: "",
    title: "",
    game: "",
    time: "",
    timeEnd: "",
  };

  let pos = req.body.pos;

  for (const elem in params) {
    if (params[elem] && elem !== "Enabled") {
      if (elem === "Image")
        val.image =
          "https://static-cdn.jtvnw.net/ttv-boxart/516575-600x800.jpg";
      else if (elem === "Title") val.title = "Today we play VALORANT RANKED";
      else if (elem === "Game") val.game = "VALORANT";
      else if (elem === "Time") {
        val.time = "Started: 21:30";
        if (pos === "end") val.timeEnd = "Ended: 00:00";
      }
    }
  }
  if (link === "") link = "CLICK ME";

  let twitchChan;
  twitchArr.map((e) => {
    if (e.select) twitchChan = e.login;
  });

  const inizioliveDiscord = new MessageEmbed().setTitle(phrase);

  if (params.Title) inizioliveDiscord.setDescription("📣: " + val.title);
  if (params.Image) inizioliveDiscord.setImage(val.image);
  if (params.Game) inizioliveDiscord.addField("🎮GAME :", val.game);
  if (params.Time) {
    inizioliveDiscord.addField("⏳ STARTED:", val.time);
    if (pos === "end") inizioliveDiscord.addField("⏳ ENDED:", val.timeEnd);
  }
  inizioliveDiscord
    .setColor(color)
    .setURL(`https://www.twitch.tv/${twitchChan}`);

  let row = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel(link)
      .setURL(`https://www.twitch.tv/${twitchChan}`)
      .setStyle("LINK")
  );

  botDiscord.users
    .createDM(idUtenteDiscord)
    .then((user) =>
      user.send({ embeds: [inizioliveDiscord], components: [row] })
    )
    .then(() => res.sendStatus(200))
    .catch((e) => res.send("RIATTIVA I MESSAGGI COGLIONE"));
});

module.exports = {route, botDiscord};
