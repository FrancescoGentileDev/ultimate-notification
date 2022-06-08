import * as React from "react";
import Typography from "@mui/material/Typography";
import "./discordnot.css";
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
import { HuePicker } from 'react-color';

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
  const [color, setColor] = React.useState("#ffffff")
 //#endregion
 

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
        .post("/api/discord/preview", {
          switch: switchVal,
          phrase: phrase,
          link: Link,
          color: color,
          pos: props.index,
        }, { headers: { seche: process.env.REACT_APP_SECHE } })
        .then((e) => {
          setSavePreview("PREVIEW");
        });
    }
  };

  const previewTip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Preview is send in your private chat with the bot, make sure you have enabled "Permit server member send direct message"
    </Tooltip>
  );

  const handleSave = () => {
    if(save==='*SAVE') {
    setSave(
      <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
    )

    let string= props.index + 'Not'
    let not = {
      checked: switchVal.Enabled,
      image: switchVal.Image,
      title: switchVal.Title,
      game: switchVal.Game,
      time: switchVal.Time,
      phrase: phrase,
      color: color,
      link: Link,
      
    }



    axios.post('/api/saveNot', {not: not, pos: string, con: 'discord'}, { headers: { seche: process.env.REACT_APP_SECHE } })
    .then((e) => {
      document.getElementById(`unsaved${props.index}`).style.display = "none"
      setSave('SAVE')
    })


  }

  }


//#region FETCH INIZIALE
React.useEffect(() => {

  axios.get('/api/sessionData', { headers: { seche: process.env.REACT_APP_SECHE } })
    .then(e => {
      let sesData = e.data
      setSessData(sesData);
      let string = props.index + 'Not'
      let not = e.data.discord[string]
      let base = e.data.twitchId
      
      var index =base.findIndex(e => e.select===true)
      
 

      setSwitch({
            Enabled: not.checked,
            Image: not.image,
            Title: not.title,
            Game: not.game,
            Time: not.time,
      })
      setColor(not.color)
      setPhrase(not.phrase)
      setLink(not.link)
      document.getElementById("TextId" + props.index).value = not.phrase
      document.getElementById("LinkId" + props.index).value = not.link

      if(index===-1)
        setname("Brobbolo")
      else
       setname(base[index].login.toUpperCase())

})}, [])
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
    if (switchVal.Enabled && sessData.discord.userId) setPreview(false);
    else setPreview(true);

    if (props.index === "end") setFinita(<div>⌛ <strong>Ended:</strong> <br/> {new Date().toLocaleDateString("en-UK", { year: "numeric", month: "long", day: "numeric"})}, 23:59 <br /></div>);
    else setFinita("");

  }, [switchVal])
//#endregion


  const handleInput = (event) => {
    setPhrase(event.target.value)
  };

  const handleSwitch = (event, valore) => {
    setSwitch({...switchVal, [event.target.name]: event.target.checked  })
  };

  const handleLink = (event, valore) => {
    setLink(event.target.value);
  };

  const handleColor = (e) => {
    setColor(e.hex)
  }

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
      color: color,
      link: Link,
    };
    let check = false;
  
      for (const elem in obj)
        if (obj[elem] !== sessData.discord[string][elem]) check = true;

    if (check)
    {
     setSave("*SAVE");
     document.getElementById(`unsaved${props.index}`).style.display = "block"
    }

    else {
      document.getElementById(`unsaved${props.index}`).style.display = "none"
      setSave("SAVE")};
  }
}, [Link, phrase, switchVal, color]);

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
             <HuePicker onChange={handleColor} color={color}/>
              </div>


              <TextField
                id={"LinkId" + props.index}
                placeholder="link button text"
                label="link button text"
                helperText="we automatically add a link to your twitch channel, this is only text of button"
                variant="filled"
                className="text"
                color="secondary"
                multiline
                onChange={handleLink}
                sx={{ mt: 2 }}
              />
              
            </div>
            <div className="col-auto text-right order-1"  >
              <div className="card-notifica shadow notdiscord" style={{borderLeftColor: color}} >
                <div className="col">
                  <Typography sx={{ ml: 1 }} style={{ fontSize: "18px", color: '#0096D1' }}>
                    <u><strong>
                      {phrase}

                    </strong></u>
                  </Typography>

                  <Typography
                    id={"TitleId" + props.index}
                    sx={{ ml: 1 }}
                  >
                   
                        📣:Today we play VALORANT RANKED
                  </Typography>

                  <Typography
                    id={"GameId" + props.index}
                    fontWeightBold
                    sx={{mt:1, ml: 1 }}
                    style={{ fontSize: "14px" }}
                  >
                    🎮 <strong>Game:</strong><br/> VALORANT
                    <br />
                  </Typography>
                  <Typography
                    id={"TimeId" + props.index}
                    sx={{mt:1, ml: 1 }}
                    style={{ fontSize: "14px", fontWeight: "Bold" }}
                  >
                    ⏳ <strong>Started:</strong> <br/> {new Date().toLocaleDateString("en-UK", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} <br />
                    {finita}
                   
                  </Typography>
                  <img
                    src="https://static-cdn.jtvnw.net/ttv-boxart/VALORANT.jpg"
                    id={"ImageId" + props.index}
                    className="gameBoxDiscord"
                    alt="cooso"
                  />
                </div>
              </div>
              <div className="card-linkButton shadow">
                <div className="card-body-bottone">
                  <FontAwesomeIcon
                    style={{ marginLeft: "90%" }}
                    className="icon"
                    icon={faExternalLinkAlt}
                  />
                  <Typography sx={{ mt: -1, pb: 1.7 }}>
                    {Link}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body" style={{ textAlign: "right" }}>
         <Button variant="contained" sx={{ px: 5 }} style={{ float: "right" }} onClick= {handleSave}>
            {" "}
            {save}{" "}
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
