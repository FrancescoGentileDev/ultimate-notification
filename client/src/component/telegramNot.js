/* eslint-disable react-hooks/exhaustive-deps */
import * as React from "react";
import Typography from "@mui/material/Typography";
import "./telegramnot.css";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import Spinner from "react-bootstrap/Spinner";
import Popover from "@mui/material/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
const axios = require("axios").default;
const Telegramnot = (props) => {

  //#region DICHIARAZIONE STATE
  const [phrase, setPhrase] = React.useState();
  const [switchVal, setSwitch] = React.useState({
    Enabled: false,
    Image: false,
    Title: false,
    Game: false,
    Time: false,
  });
  const [finita, setFinita] = React.useState("");
  const [sessData, setSessData] = React.useState(null);
  const [Link, setLink] = React.useState();
  const [save, setSave] = React.useState("SAVE");
  const [name, setname] = React.useState("");
  const [preview, setPreview] = React.useState(true);
  const [savePreview, setSavePreview] = React.useState("PREVIEW");
 //#endregion
 
 
  const handleSave = () => {
    if (save === "*SAVE") {
      setSave(
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
      );

      let string = props.index + "Not";
      let not = {
        checked: switchVal.Enabled,
        image: switchVal.Image,
        title: switchVal.Title,
        game: switchVal.Game,
        time: switchVal.Time,
        phrase: phrase,
        link: Link,
      };

      axios
        .post("/api/saveNot", { not: not, pos: string, con: "telegram" }, { headers: { seche: process.env.REACT_APP_SECHE } })
        .then((e) => {
          document.getElementById(`unsaved${props.index}`).style.display = "none"
          setSave("SAVE");
        });
    } else console.log("NON ENTRATO");
  };

  const handlePreview = (e) => {
    if (savePreview === "PREVIEW") {
      setSavePreview(
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        />
      );
      axios
        .post("/api/telegram/preview", {
          switch: switchVal,
          phrase: phrase,
          link: Link,
          pos: props.index,
        }, { headers: { seche: process.env.REACT_APP_SECHE } })
        .then((e) => {
          setSavePreview("PREVIEW");
        });
    }
  };


   //#region FETCH INIZIALE
  React.useEffect(() => {
    axios.get("/api/sessionData", { headers: { seche: process.env.REACT_APP_SECHE } }).then((e) => {
      let sesData = e.data;
      let string = props.index + "Not";
      let not = e.data.telegram[string];
      let base = e.data.twitchId;
      setSessData(sesData);
      var index = base.findIndex((e) => e.select === true);

      setSwitch({
        Enabled: not.checked,
        Image: not.image,
        Title: not.title,
        Game: not.game,
        Time: not.time,
      });

      setPhrase(not.phrase);
      setLink(not.link);
      document.getElementById("TextId" + props.index).value = not.phrase;
      document.getElementById("LinkId" + props.index).value = not.link;

      if (index === -1) setname("Brobbolo");
      else setname(base[index].login.toUpperCase());

      if (e.data.telegram.userId && e.data.telegram[string].checked)
        setPreview(false);
    });
  }, []);

//#endregion


 //#region GESTIONE NASCONDI 
  React.useEffect(() => {
    for (const elem in switchVal) {
      if (switchVal[elem])
        document.getElementById(elem + "Id" + props.index).style =
          "display: block";
      else
        document.getElementById(elem + "Id" + props.index).style =
          "display: none";
    }

    if (switchVal.Enabled && sessData.telegram.userId) setPreview(false);
    else setPreview(true);

    if (props.index === "end") setFinita(<div> ⌛ Ended: 00:00</div>);
    else setFinita("");
  }, [switchVal]);
//#endregion


  const handleInput = (event) => {
    setPhrase(event.target.value);
  };

  const handleSwitch = (event, valore) => {
    setSwitch({ ...switchVal, [event.target.name]: event.target.checked });
  };

  const handleLink = (event, valore) => {
    setLink(event.target.value);
  };

  const previewTip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Preview is send in your private chat with the bot
    </Tooltip>
  );



  //#region GESTIONE UNSAVED
  React.useEffect(() => {
    let string = props.index + "Not";
    if (sessData !== null) {
      let obj = {
        checked: switchVal.Enabled,
        phrase: phrase,
        game: switchVal.Game,
        title: switchVal.Title,
        time: switchVal.Time,
        image: switchVal.Image,
        link: Link,
      };
      let check = false;

        for (const elem in obj)
          if (obj[elem] !== sessData.telegram[string][elem]) check = true;

      if (check)
      {
       setSave("*SAVE");
       document.getElementById(`unsaved${props.index}`).style.display = "block"
      }

      else {
        document.getElementById(`unsaved${props.index}`).style.display = "none"
        setSave("SAVE")};
    }
  }, [Link, phrase, switchVal]);

//#endregion




  return (
    <div className="col-12 mx-auto ">
      <div className="card main">
        <div className="card-header" style={{ color: "white" }}>
          <FormControlLabel
            control={
              <Switch
                name="Enabled"
                checked={switchVal.Enabled}
                onChange={handleSwitch}
              />
            }
            label={<h5 style={{ marginTop: "7px" }}>{props.title}</h5>}
          />
        </div>
        <div id={"EnabledId" + props.index} className="card-body">
          <div className="row">
            <div className="col order-2">
              <TextField
                id={"TextId" + props.index}
                label="Incitement phrase"
                variant="filled"
                focused
                className="text"
                helperText="Insert the first phrase of your notification"
                color="secondary"
                multiline
                onChange={handleInput}
                sx={{ mt: 2 }}
              />
              <div className="col-12 col-xl-5 col-lg-5 col-xxl-5 col-md-7  ">
                <FormGroup style={{ color: "white" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="Image"
                        checked={switchVal.Image}
                        onChange={handleSwitch}
                      />
                    }
                    label="📸 Game image"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        name="Title"
                        checked={switchVal.Title}
                        onChange={handleSwitch}
                      />
                    }
                    label="📢Live title"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        name="Game"
                        checked={switchVal.Game}
                        onChange={handleSwitch}
                      />
                    }
                    label="🎮Game"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        name="Time"
                        checked={switchVal.Time}
                        onChange={handleSwitch}
                      />
                    }
                    label="⌛Time"
                  />
                </FormGroup>
              </div>
              <TextField
                id={"LinkId" + props.index}
                placeholder="link button text"
                label="link button text"
                helperText="we automatically add a link to your twitch channel, this is only text of button 🤯"
                variant="filled"
                className="text"
                color="secondary"
                focused
                multiline
                onChange={handleLink}
                sx={{ mt: 2 }}
              />
            </div>
            <div className="col-auto text-right order-1">
              <div className="card-2 shadow notTelegram" style={{}}>
                <div
                  className="card-header"
                  style={{ fontSize: "15px", color: "purple" }}
                >
                  <strong>{name}</strong>
                </div>
                <img
                  src="https://static-cdn.jtvnw.net/ttv-boxart/516575-600x800.jpg"
                  id={"ImageId" + props.index}
                  className="gameBox"
                  alt="cooso"
                  on
                />
                <div style={{ width: "100%" }}>
                  <Typography sx={{ ml: 1, fontSize: "0.80rem" }}>
                    <strong>
                      {phrase}
                      <br />
                      <br />
                    </strong>
                  </Typography>

                  <Typography
                    id={"TitleId" + props.index}
                    sx={{ ml: 1, fontSize: "0.80rem" }}
                  >
                    <b>
                      <i> 📌: Today we play VALORANT RANKED</i>
                    </b>
                    <br />
                  </Typography>

                  <Typography
                    id={"GameId" + props.index}
                    fontWeightBold
                    sx={{ ml: 1, fontSize: "0.80rem" }}
                  >
                    <b>🎮: VALORANT</b>
                    <br />
                  </Typography>
                  <Typography
                    id={"TimeId" + props.index}
                    sx={{ ml: 1, fontSize: "0.80rem" }}
                  >
                    <b>
                      ⏳ Started: 21:30
                      {finita}
                    </b>
                    <br />
                  </Typography>
                </div>
                <Typography
                  sx={{ mr: 1, mt: "-4px" }}
                  style={{
                    textAlign: "right",
                    color: "gray",
                    fontSize: "13px",
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                  4ㅤ21:30
                </Typography>
              </div>
              <div className="card-3 shadow">
                <div className="card-body-bottone">
                  <FontAwesomeIcon
                    style={{ marginLeft: "90%" }}
                    className="icon"
                    icon={faExternalLinkAlt}
                  />
                  <Typography sx={{ mt: -1, pb: 1.7 }}>
                    {Link}
                    <br />
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">

          
          <Button
            variant="contained"
            sx={{ px: 5 }}
            onClick={handleSave}
            style={{ float: "right" }}
          >
            {save}
          </Button>
          <Typography id={`unsaved${props.index}`} sx= {{color: "white", mr: 2, mt: 1}} style={{float: "right", display: 'none'}}>*UNSAVED CHANGES</Typography>
          <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={previewTip}
          >
            <Button
              variant="contained"
              sx={{ px: 5 }}
              onClick={handlePreview}
              disabled={preview}
              style={{ float: "left" }}
            >
              {savePreview}
            </Button>
          </OverlayTrigger>
        </div>
      </div>
    </div>
  );
};

export default Telegramnot;
