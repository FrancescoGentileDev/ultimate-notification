const bcrypt = require("bcrypt");
const HmacSHA256 = require("crypto-js").HmacSHA256;
const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.API_KEY_MAIL);

const insertUser = async (req, res, next) => {
  let body = req.body;
  if (!body.password || !body.email || !body.username || req.error) {
    console.log("ciao");
    next();
  } else {
    const hashedpass = await cripta(body.password);
    let unique = HmacSHA256(body.username.toLowerCase() + body.email.toLowerCase(), Math.random().toString(36).substring(2, 15)).toString();
    let mailunique = HmacSHA256(body.username.toLowerCase() + body.email.toLowerCase(), Math.random().toString(36).substring(2, 15)).toString();
    sendMail(body.email.toLowerCase(), mailunique);
    let newuser = {
      username: body.username.toLowerCase(),
      password: hashedpass,
      email: body.email.toLowerCase(),
      enabled: false,
      tempcode: mailunique,
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

    const registrazione = await req.userCollection.insertOne(newuser);
    console.log(registrazione);
    if (registrazione.acknowledged === true) {
      console.log("registrazione avvenuta con successo");
      next();
    } else {
      req.error = true;
      next();
    }
  }
};

const validation = async (req, res, next) => {
  if (!req.body.password || !req.body.email || !req.body.username) {
    req.error = true;
    next();
  }
  var cEmail = false;
  var cUsername = false;
  if (await req.userCollection.findOne({ username: req.body.username })) {
    cUsername = true;
  }
  if (await req.userCollection.findOne({ email: req.body.email })) {
    cEmail = true;
  }

  console.log(cEmail + " " + cUsername);
  if (cEmail && cUsername) {
    req.error = true;
    next();
  } else if (!cEmail && cUsername) {
    req.error = true;
    next();
  } else if (cEmail && !cUsername) {
    req.error = true;
    next();
  } else if (!cEmail && !cUsername) {
    req.error = false;
    next();
  }
};

async function cripta(body) {
  const saltround = 10;
  const salt = await bcrypt.genSalt(saltround);
  const hash = await bcrypt.hash(body, salt);
  return hash;
}

function sendMail(mail, code) {
  const msg = {
    to: mail, // Change to your recipient
    from: "confimation@ultimatenotification.com", // Change to your verified sender
    dynamic_template_data: {
      callbackUrl: `${process.env.SITE}/api/mailconfirmation?code=${code}`,
    },
    template_id: "d-687913ccb87f4678b05764de1e9936e8",
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
}

let profile = class {
  constructor(mail) {
    this.mail = mail;
  }
  deleteProfile() {}
};

module.exports = {
  insetuser: insertUser,
  validation: validation,
};
