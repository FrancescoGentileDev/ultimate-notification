const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const localStrategy = require("passport-local").Strategy;
const { MongoClient, ObjectId } = require("mongodb");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
var FacebookStrategy = require("passport-facebook");
var DiscordStrategy = require("passport-discord").Strategy;
const HmacSHA256 = require("crypto-js").HmacSHA256;
require("dotenv").config();

//#region MONGO CONNECTIONS

module.exports = function (passport) {
  const mongoClient = new MongoClient(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    mongoClient.connect();
  } catch (err) {
    res.send("ERRORE CONNESSIONE AL SERVER");
  }

  console.log("Connessione avvenuta passport");
  const dbUtenti = mongoClient.db("Utenti");
  const userCollection = dbUtenti.collection("user");
  //#endregion

  //#region local strategy
  passport.use(
    "local-login",
    new localStrategy(async function (username, password, done) {
      const Utente = userCollection.findOne({ email: username.toLowerCase() }, (err, user) => {
        console.log(user);
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, "userNot");
        }

        if (user.enabled === false) return done(null, false, "notEnabled");

        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, "PassWrong");
        }
        return done(null, user);
      });
    })
  );
  //#endregion

  //#region GOOGLE STRATEGY

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID_GOOGLE,
        clientSecret: process.env.CLIENT_SECRET_GOOGLE,
        callbackURL: `${process.env.SITE}/auth/google/callback`,
        passReqToCallback: true,
      },
      async (request, accessToken, refreshToken, profile, done) => {
        let username = "user" + profile.id;
        userCollection.findOne({ email: profile.email }, async (err, user) => {
          if (err) return done(err);
          else if (!user) {
            let password = await HmacSHA256(profile.id.toLowerCase(), Math.random().toString(36).substring(2, 15)).toString();
            let unique = await HmacSHA256(profile.email.toLowerCase(), Math.random().toString(36).substring(2, 15)).toString();
            let newuser = {
              username: username,
              password: password,
              email: profile.email.toLowerCase(),
              enabled: true,
              data: {
                twitchId: [],
                selectProfile: {},
                telegram: {
                  uniquecode: unique,
                  userId: null,
                  IdList: [],
                  checked: false,

                  startNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                  },
                  midNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                  },
                  endNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                  },
                },
                discord: {
                  idList: { guild: "", channels: [] },
                  checked: false,

                  startNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    color: "#5bff00",
                    link: "",
                  },
                  midNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    color: "#5bff00",
                    link: "",
                  },
                  endNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    color: "#5bff00",
                    link: "",
                  },
                },
                tempvar: {
                  timezone: "Europe/Berlin",
                  sendnot: [0,0,0,0,0,0,0,0,0,0,0,0]
                },
              },
            };
            let ex = await new Promise(async (resolve, reject) => {
              resolve(await userCollection.insertOne(newuser));
            }).then(async (userIns) => {
              let gigi = await userCollection.findOne({ _id: ObjectId(userIns.insertedId) });
              return gigi;
            });
            return done(null, ex);
          } else if (user) done(null, user);
        });
      }
    )
  );

  //#endregion

  //#region FACEBOOK STRATEGY
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.CLIENT_ID_FACEBOOK,
        clientSecret: process.env.CLIENT_SECRET_FACEBOOK,
        callbackURL: `${process.env.SITE}/auth/facebook/callback`,
        profileFields: ["id", "email", "name"],
      },
      (accessToken, refreshToken, profile, done) => {
        var query = "username";
        console.log(profile);
        let incognita = "nomail";
        let username = "user" + profile.id;
        let queryval = username;

        if (profile.emails[0].value) {
          incognita = profile.emails[0].value;
          query = "email";
          queryval = incognita;
        }

        userCollection.findOne({ [query]: queryval }, async (err, user) => {
          if (err) return done(err);
          else if (!user) {
            let password = await HmacSHA256(profile.id.toLowerCase(), Math.random().toString(36).substring(2, 15)).toString();
            let unique = await HmacSHA256(incognita, Math.random().toString(36).substring(2, 15)).toString();
            let newuser = {
              username: username,
              password: password,
              email: incognita,
              enabled: true,
              data: {
                twitchId: [],
                selectProfile: {},
                telegram: {
                  uniquecode: unique,
                  userId: null,
                  IdList: [],
                  checked: false,

                  startNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                  },
                  midNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                  },
                  endNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                  },
                },
                discord: {
                  idList: { guild: "", channels: [] },
                  checked: false,

                  startNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    color: "#5bff00",
                    link: "",
                  },
                  midNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    color: "#5bff00",
                    link: "",
                  },
                  endNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    color: "#5bff00",
                    link: "",
                  },
                },
                tempvar: {
                  timezone: "Europe/Berlin",
                  sendnot: [0,0,0,0,0,0,0,0,0,0,0,0]
                },
              },
            };
            let ex = await new Promise(async (resolve, reject) => {
              resolve(await userCollection.insertOne(newuser));
            }).then(async (userIns) => {
              let gigi = await userCollection.findOne({ _id: ObjectId(userIns.insertedId) });
              return gigi;
            });
            return done(null, ex);
          } else if (user) done(null, user);
        });
      }
    )
  );

  //#endregion

  //#region DISCORD STRATEGY

  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: `${process.env.SITE}/auth/discord/callback`,
        scope: ["identify", "email"],
      },
      function (accessToken, refreshToken, profile, done) {
        let username = "user" + profile.id;
        userCollection.findOne({ email: profile.email }, async (err, user) => {
          if (err) return done(err);
          else if (!user) {
            let password = await HmacSHA256(profile.id.toLowerCase(), Math.random().toString(36).substring(2, 15)).toString();
            let unique = await HmacSHA256(profile.email.toLowerCase(), Math.random().toString(36).substring(2, 15)).toString();
            let newuser = {
              username: username,
              password: password,
              email: profile.email.toLowerCase(),
              enabled: true,
              data: {
                twitchId: [],
                selectProfile: {},
                telegram: {
                  uniquecode: unique,
                  userId: null,
                  IdList: [],
                  checked: false,

                  startNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                  },
                  midNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                  },
                  endNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                  },
                },
                discord: {
                  idList: { guild: "", channels: [] },
                  checked: false,

                  startNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    color: "#5bff00",
                    link: "",
                  },
                  midNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    link: "",
                    color: "#5bff00",
                  },
                  endNot: {
                    checked: false,
                    phrase: "",
                    game: true,
                    title: true,
                    time: true,
                    image: true,
                    color: "#5bff00",
                    link: "",
                  },
                },
                tempvar: {
                  timezone: "Europe/Berlin",
                  sendnot: [0,0,0,0,0,0,0,0,0,0,0,0]
                },
              },
            };
            let ex = await new Promise(async (resolve, reject) => {
              resolve(await userCollection.insertOne(newuser));
            }).then(async (userIns) => {
              let gigi = await userCollection.findOne({ _id: ObjectId(userIns.insertedId) });
              return gigi;
            });
            return done(null, ex);
          } else if (user) done(null, user);
        });
      }
    )
  );

  //#endregion

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    const user = await userCollection.findOne({ _id: ObjectId(id) });
    done(null, user);
  });
};
