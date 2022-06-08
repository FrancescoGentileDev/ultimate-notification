/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-target-blank */

import React, { Component } from "react";
import Sidebar from "../component/sidebar";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import moment from "moment-timezone";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { Helmet } from "react-helmet";
const sett = createTheme({
  setting: {
    primary: {
      main: '#ca3e47',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      contrastText: '#ffffff',
    },
    text: {
      primary: "#fff",
      secondary: "#fff",
      login: "#000"
    },

     another: {
      main: '#fff',
      contrastText: '#fff',
    },
  },
});
const StyledAutocomplete = styled(Autocomplete)({
  "& .MuiAutocomplete-root": {
   
  },
  "& 	.MuiAutocomplete-inputRoot" : {
      backgroundColor: "white",
      color: "black",
      
    },
   
});

const axios = require("axios").default;

export default function Settings() {
  const [sessData, setSessData] = React.useState({
    data: {
      tempvar: {
        timezone: "Europe/Berlin"
      }
    }
  });

  const [twitchSel, setTwitchSel] = React.useState([]);
  const [saveTwitch, setSaveTwitch] = React.useState("SAVE");
  const [showTwitch, setShowTwitch] = React.useState(false);

  const [showTelegram, setShowTelegram] = React.useState(false);
  const [TelegramSel, setTelegramSel] = React.useState([]);
  const [saveTelegram, setSaveTelegram] = React.useState("SAVE");
  const [telegramAlert, setTelegramAlert] = React.useState("");
  const [telegramLink, setTelegramLink] = React.useState("");

  var timezones= []
  timezones = moment.tz.names().map((val, index) => {
    return val
})

  const [timezone, setTimezone] = React.useState("")

  const [discordSel, setDiscordSel] = React.useState([]);

  const handleTwitchShow = () => setShowTwitch(true);
  const handleTwitchClose = () => setShowTwitch(false);

  const handleTelegramShow = () => setShowTelegram(true);
  const handleTelegramClose = () => setShowTelegram(false);

  const handleTwitchChange = (event) => {
    let tempar = [...twitchSel];
    console.log("QUESTO E TWITCH CHANGE");
    console.log(twitchSel);
    let ex1 = new Promise((resolve, reject) => {
      resolve(tempar.findIndex((e) => e.select === true));
    }).then((e) => {
      if (e !== -1) tempar[e].select = false;

      // eslint-disable-next-line no-unused-vars
      let ex2 = new Promise((resolve, reject) => {
        resolve(tempar.findIndex((e) => e.id === parseInt(event.target.value)));
      })
        .then((e) => {
          tempar[e].select = true;
        })
        .then(() => {
          setTwitchSel(tempar);
        })
        .then(() => {
          axios.post("/api/saveTwitchArray", twitchSel, { headers: { seche: process.env.REACT_APP_SECHE } });
        });
    });
  };

  const handleTwitchSave = () => {
    var name = document.getElementById("twitch-url").value.toLowerCase();
    console.log("ciao come va");
    if (saveTwitch === "SAVE") {
      if (name !== "" && !twitchSel.find((e) => e.login === name)) {
        console.log("dentro if");
        setSaveTwitch(<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />);

        axios
          .get("/api/getTwitchId", { params: { login: name }, headers: { seche: process.env.REACT_APP_SECHE } })
          .then((response) => {
            console.log(response);
            axios
              .post("/api/saveTwitchProfile", {
                login: name,
                id: response.data,
              }, { headers: { seche: process.env.REACT_APP_SECHE } })
              .then((e) => {
                let temparr = [...twitchSel];
                temparr.push({ login: name, id: response.data });
                setTwitchSel(temparr);
              });
          })
          .then(() => {
            setSaveTwitch("SAVE");
            handleTwitchClose();
          })

          .catch((error) => {
            handleTwitchClose();
            setSaveTwitch("SAVE");
          });
      } else handleTwitchClose();
    }
  };

  const handleTelegramSave = async () => {
    let name = document.getElementById("telegram-name").value.toLowerCase();

    if (saveTelegram === "SAVE") {
      if (name !== "" && TelegramSel.findIndex((e) => e.name === name) === -1) {
        setSaveTelegram(<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />);

        axios
          .get("/api/telegram/checkTelegram", { params: { name: name }, headers: { seche: process.env.REACT_APP_SECHE } })
          .then((e) => {
            if (!e.data.ok) {
              setTelegramAlert(
                <div className="alert alert-danger" role="alert">
                  {e.data.description}
                </div>
              );
              setSaveTelegram("SAVE");
            } else {
              console.log("prova entrato");
              let temparr = [...TelegramSel];
              temparr.push({
                name: name,
                id: e.data.description,
                select: false,
              });
              setTelegramSel(temparr);
              axios.post("/api/telegram/savetelegram", { data: temparr }, { headers: { seche: process.env.REACT_APP_SECHE } });
            }
            return e.data.ok;
          })
          .then((e) => {
            setSaveTelegram("SAVE");
            if (e) {
              handleTelegramClose();
              setTelegramAlert("");
            }
          });
      } else handleTelegramClose();
    }
  };

  const handleTelegramChange = (event) => {
    console.log("QUESTO E TELEGRAM CHANGE");
    let tempar = [...TelegramSel];
    console.log(TelegramSel);
    let ex3 = new Promise((resolve, reject) => {
      resolve(tempar.findIndex((e) => e.select === true));
    }).then((e) => {
      if (e !== -1) tempar[e].select = false;

      let ex4 = new Promise((resolve, reject) => {
        resolve(tempar.findIndex((elem) => elem.id === parseInt(event.target.value)));
      })
        .then((index) => {
          console.log(index);
          tempar[index].select = true;
        })
        .then(() => {
          setTelegramSel(tempar);
        })
        .then(() => {
          axios.post("/api/telegram/savetelegram", { data: TelegramSel }, { headers: { seche: process.env.REACT_APP_SECHE } });
        });
    });
  };

  const handleDiscordChange = (event) => {
    console.log("QUESTO E DISCORD CHANGE");
    let tempar = [...discordSel];

    let ex5 = new Promise((resolve, reject) => {
      resolve(tempar.findIndex((e) => e.select === true));
    }).then((e) => {
      if (e !== -1) tempar[e].select = false;

      let ex6 = new Promise((resolve, reject) => {
        resolve(tempar.findIndex((e) => e.id === event.target.value));
      })
        .then((e) => {
          tempar[e].select = true;
        })
        .then(() => {
          setDiscordSel(tempar);
        })
        .then(() => {
          console.log(discordSel);
          axios.post("/api/discord/saveDiscord", discordSel, { headers: { seche: process.env.REACT_APP_SECHE } });
        });
    });
  };
  //event.target.attributes.name.value
  const handleRemove = (event) => {
    console.log(event.target.attributes.name.value);
    let elem = event.target.attributes.name.value;
    var temparr = [];
    var funzione;
    if (elem === "Twitch") {
      temparr = [...twitchSel];
    } else if (elem === "Telegram") {
      temparr = [...TelegramSel];
    }

    let value = document.getElementById("select" + elem).value;
    console.log(value);

    temparr.splice(
      temparr.findIndex((e) => e.id === parseInt(value)),
      1
    );
    console.log(temparr);
    if (elem === "Twitch") {
      setTwitchSel(temparr);
      axios.post("/api/saveTwitchArray", temparr, { headers: { seche: process.env.REACT_APP_SECHE } });
    } else if (elem === "Telegram") {
      setTelegramSel(temparr);
      axios.post("/api/telegram/savetelegram", { data: temparr }, { headers: { seche: process.env.REACT_APP_SECHE } });
    }
  };

  const handleTimezone = (e, nuovo) => {
    
    if(nuovo!== null) {
     axios.post("/api/settimezone", {data: nuovo}, { headers: { seche: process.env.REACT_APP_SECHE } }); 
     setTimezone(nuovo)
    }
  }



  React.useEffect(() => {
    axios
      .get("/api/sessionData", { headers: { seche: process.env.REACT_APP_SECHE } })
      .then((e) => {
        setSessData(e.data);
        return e.data;
      })
      .then((dt) => {
        setTwitchSel(dt.twitchId);
        setTelegramSel(dt.telegram.IdList);
        setDiscordSel(dt.discord.idList.channels);
        setTelegramLink("https://t.me/UltimateNotificationBot?start=" + dt.telegram.uniquecode);
        setTimezone(dt.tempvar.timezone);
      });
  }, []);

  return (
    <div>
      <Helmet>
        <title>Settings -Ultimate Notification</title>
        <meta name="title" content="Settings" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ultimatenotification.com/" />
        <meta property="og:title" content="🚀Ultimate Notification🚀- CUSTOM, FAST, FREE" />
        <meta property="og:description" content="Fast and customizable notification for your twitch channel. Send in discord, telegram and messenger a beauty notification.FREE" />
        <meta property="og:image" content="/android-chrome-512x512.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://ultimatenotification.com/" />
        <meta property="twitter:title" content="🚀Ultimate Notification🚀- CUSTOM, FAST, FREE" />
        <meta property="twitter:description" content="Fast and customizable notification for your twitch channel. Send in discord, telegram and messenger a beauty notification.FREE" />
        <meta property="twitter:image" content="/android-chrome-512x512.png" />
      </Helmet>
      <div className="container-sett" style={{ color: "white" }}>
        <div className="row">
          <h1>Settings</h1>
        </div>
        <hr style={{ "margin-bottom": "4rem" }} />
        <div className="row ">
          <h2>Main connection</h2>
          <div className="col col-xl-6 mx-auto mt-3 ml-2">
            <div className="card cacc shadow border-start-danger text-white bg-dark mb-3 ">
              <div className="card-header text-center" style={{ "font-size": "2rem" }}>
                Twitch
                <i className="bi bi-twitch" />
              </div>
              <div className="card-body mb-3">
                <div className="row">
                  <label htmlFor className="form-label ">
                    Select or Add Account
                  </label>

                  <div className="col-8">
                    <Form.Select id="selectTwitch" aria-label="add account by click add" onChange={handleTwitchChange}>
                      <option value="-1">Add or select account...</option>
                      {twitchSel.map((e, index) => {
                        return (
                          <option key={index} value={e.id} selected={e.select}>
                            {e.login}
                          </option>
                        );
                      })}
                    </Form.Select>
                    <button type="button" style={{ marginTop: "1rem" }} className="btn btn-danger btn px-3" name="Twitch" onClick={handleRemove}>
                      Remove
                    </button>
                  </div>
                  <div className="col text-center">
                    <button type="button" className="btn btn-danger btn px-3" onClick={handleTwitchShow}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr style={{ "margin-top": "2rem", "margin-bottom": "2rem" }} />
        <div className="row mt-3">
          <h2>Channel connection</h2>
          <div className="col mt-3 ml-2">
            <div className="card cacc shadow border-start-danger text-white bg-dark mb-3">
              <div className="card-header text-center" style={{ "font-size": "2rem" }}>
                Telegram
                <i className="bi bi-telegram" />
              </div>
              <div className="card-body mb-2">
                <div className="row">
                  <label htmlFor className="form-label">
                    Select or Add Channel{" "}
                  </label>
                  <div className="col-7" style={{ margin: "auto" }}>
                    <Form.Select id="selectTelegram" aria-label="add account by click add" onChange={handleTelegramChange}>
                      <option value="-1">Select...</option>
                      {TelegramSel.map((e, index) => {
                        return (
                          <option key={index} value={e.id} selected={e.select}>
                            {e.name}
                          </option>
                        );
                      })}
                    </Form.Select>
                    <button type="button" style={{ marginTop: "1rem" }} className="btn btn-danger btn px-3" name="Telegram" onClick={handleRemove}>
                      Remove
                    </button>
                  </div>
                  <div className="col-5 text-center">
                    <button type="button" className="btn btn-danger btn-sm px-4" onClick={handleTelegramShow}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col mt-3 ml-2">
            <div className="card cacc shadow border-start-danger text-white bg-dark mb-3">
              <div className="card-header text-center" style={{ "font-size": "2rem" }}>
                Discord
                <i className="bi bi-discord" />
              </div>
              <div className="card-body mb-2">
                <div className="row">
                  <label htmlFor className="form-label">
                    Select notification channel{" "}
                  </label>
                  <div className="col-7">
                    <Form.Select id="selectDiscord" aria-label="add account by click add" onChange={handleDiscordChange}>
                      <option value="-1">Select...</option>
                      {discordSel.map((e, index) => {
                        return (
                          <option key={index} value={e.id} selected={e.select}>
                            {e.name}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </div>
                  <div className="col-5 mx-auto text-center">
                    <a
                      href="https://discord.com/api/oauth2/authorize?client_id=950791583299678279&permissions=292058037248&redirect_uri=https%3A%2F%2Fultimatenotification.com%2Fapi%2Fdiscord%2Fregistration&response_type=code&scope=identify%20bot"
                      className="btn btn-danger btn-sm px-4"
                    >
                      Add
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col mt-3 ml-2">
            <div className="card cacc shadow border-start-danger text-white bg-dark mb-3">
              <div className="card-header text-center" style={{ "font-size": "2rem" }}>
                Messenger
                <i className="bi bi-messenger" />
              </div>
              <div className="card-body mb-2">
                <div className="row">
                  <label htmlFor className="form-label">
                    Select or Add Account{" "}
                  </label>
                  <div className="col-7">
                    <select className="form-control form-control-sm" name id disabled>
                      <option>Select...</option>
                    </select>
                  </div>
                  <div className="col-5 text-center">
                    <button type="button" className="btn btn-danger btn-sm px-4" data-bs-toggle="modal" data-bs-target="#modelId" disabled>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col mt-3 ml-2">
            <div className="card cacc shadow border-start-danger text-white bg-dark mb-3">
              <div className="card-header text-center" style={{ "font-size": "2rem" }}>
                Alexa
                <img src="https://img.icons8.com/ios-glyphs/40/ffffff/amazon-alexa-logo.png" alt="alexa" />
              </div>
              <div className="card-body mb-2">
                <div className="row">
                  <label htmlFor className="form-label">
                    Select or Add Account{" "}
                  </label>
                  <div className="col-7">
                    <select className="form-control form-control-sm" name id disabled>
                      <option>Select...</option>
                    </select>
                  </div>
                  <div className="col-5 text-center">
                    <button type="button" className="btn btn-danger btn-sm px-4" data-bs-toggle="modal" data-bs-target="#modelId" disabled>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr style={{ "margin-top": "2rem", "margin-bottom": "2rem" }} />
        <div className="row ">
          <h2>General</h2>
          <h5 style={{ "margin-top": "2rem"}}>TIMEZONE</h5>
          <ThemeProvider theme={sett}>
          <StyledAutocomplete disablePortal id="" value={timezone} options={timezones} sx={{ width: 300, }} onChange={handleTimezone} renderInput={(params) => <TextField sx={{ color: "black" }} {...params}/>} />
        </ThemeProvider>
        </div>
      </div>{" "}
      {/*------------------------------------------------MODAL TWITCH----------------------------------------------------*/}
      <Modal show={showTwitch} onHide={handleTwitchClose} className="mymodal">
        <Modal.Header closeButton>
          <Modal.Title>ADD TWITCH CHANNEL</Modal.Title>
        </Modal.Header>
        <div className="modal-body">
          <div className="container-fluid">
            <label htmlFor="twitch-url">Your twitch name</label>
            <div className="input-group ">
              <div className="input-group-prepend">
                <span className="input-group-text darkmod" id="basic-addon3">
                  https://twitch.tv/
                </span>
              </div>
              <input type="text" className="form-control" id="twitch-url" aria-describedby="basic-addon3" placeholder="GabrielSama" />
            </div>
            <small id="helpId" className="form-text mr-3" style={{ color: "white" }}>
              Copy only the last part of your twitch URL
            </small>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleTwitchClose}>
            Close
          </button>
          <button type="button" onClick={handleTwitchSave} className="btn btn-danger">
            {saveTwitch}
          </button>
        </div>
      </Modal>{" "}
      {/*----------------------------------------------MODAL TELEGRAM---------------------------------------------------*/}
      <Modal show={showTelegram} onHide={handleTelegramClose} className="mymodal">
        <Modal.Header closeButton>
          <Modal.Title>ADD TELEGRAM CHANNEL</Modal.Title>
        </Modal.Header>
        <div className="modal-body">
          <div className="container-fluid">
            <ol>
              <li>
                CLICK BUTTON AND START CHAT WITH BOT:
                <a href={telegramLink} target="_blank" className="btn btn-danger" rel="noreferrer">
                  OPEN HERE
                </a>
                <p />
              </li>
              <hr />
              <li>
                <p>
                  Invite bot in your channel and <b>grant the permissions</b> for: <strong>send, delete and pin message</strong>
                </p>
              </li>
              <hr />
              <li>
                <label htmlFor="basic-url">Insert here your telegram channel name</label>
                <div className="input-group ">
                  <div className="input-group-prepend">
                    <span className="input-group-text darkmod" id="basic-addon3">
                      @
                    </span>
                  </div>
                  <input type="text" className="form-control" id="telegram-name" aria-describedby="basic-addon3" placeholder="RightDenied" />
                </div>
                before save, make sure your channel is public <br />
                <br />
                {telegramAlert}
              </li>
              <small id="helpId" className="form-text mr-3" style={{ color: "white" }}></small>
            </ol>
            <small id="helpId" className="form-text mr-3" style={{ color: "white" }}></small>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleTelegramClose}>
            Close
          </button>
          <button type="submit" className="btn btn-danger" onClick={handleTelegramSave}>
            {saveTelegram}
          </button>
        </div>
      </Modal>{" "}
    </div>
  );
}
