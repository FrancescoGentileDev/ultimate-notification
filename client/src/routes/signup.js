import React from "react";

import TextField from "@mui/material/TextField";

import Helmet from "react-helmet";

import InputAdornment from "@mui/material/InputAdornment";

import Typography from "@mui/material/Typography";

import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";
import PersonIcon from "@mui/icons-material/Person";
import { styled } from "@mui/material/styles";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useNavigate } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner'
import ReactGA from 'react-ga';
const axios = require("axios").default;

const RoundedTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: `30px`,
      borderColor: "grey",
    },
    "&:hover fieldset": {
      borderColor: "#ca3e47",
    },
  },
});
export default function Signup() {
  let navigate = useNavigate();
  const [error, setError] = React.useState({
    email: false,
    username: false,
    password: false,
    retypePassword: false,
  });
  const [mess, setMess] = React.useState({
    email: "",
    username: "",
    password: "",
    retypePassword: "",
  });

  const [pass, setPass] = React.useState({
    lenght: "❌",
    capital: "❌",
    special: "❌",
  });
  const [passmess, setpassmess] = React.useState("");
  const [submitButt, setSubmitButt] = React.useState("SUBMIT")
  const [iconColor, setIconColor] = React.useState({
    email: "grey",
    username: "grey",
    password: "grey ",
    retypePassword: "grey",
  });

  const [retype, setretype] = React.useState(true);

  const renderTooltip = (props) => (
    <Tooltip id="formline" {...props}>
      <div>{passmess}</div>
    </Tooltip>
  );

  const [signbutt, setsignbutt] = React.useState(true);

  const handleSubmit = async () => {
    if(submitButt==="SUBMIT"){
    var obj = {
      email: document.getElementById("email"),
      username: document.getElementById("username"),
      password: document.getElementById("password"),
      retypePassword: document.getElementById("retypePassword"),
    };

    let terror = { ...error };
    let tmess = { ...mess };

    /* VALIDATION OF NULL EMPTY CAMP */

    const empty = new Promise(async (resolve, reject) => {
       setSubmitButt(<Spinner
          as="span"
          animation="border"
          role="status"
          aria-hidden="true"
        />)
      let mailcheck= await handleEmail(obj.email.value)
      let userCheck= await handleUsername(obj.username.value)
      console.log("1")
      await resolve({mailcheck, userCheck})
    }).then(async (resp) => {
      console.log("2")
      if (resp.mailcheck&& resp.userCheck &&!error.email && !error.username && !error.password && !error.retypePassword &&iconColor.password==="green" && iconColor.retypePassword==="green"  ) {
        let data = {
          email: obj.email.value,
          username: obj.username.value,
          password: obj.password.value,
        }
       
        await axios.post("/sign/api/register", data, { headers: { seche: process.env.REACT_APP_SECHE } }).then((response) => {
          console.log(response.data);
          if (response.data === 202) {
            ReactGA.event({
              category: 'User',
              action: 'Created an Account'
            });
            return navigate("/login/confirmation");
          }
          else 
          setSubmitButt("SUBMIT")
        });
      }
      else 
      setSubmitButt("SUBMIT")
    });
}
  };

  const handleChange = (e) => {
    setIconColor({ ...iconColor, [e.target.id]: "grey" });
    if (e.target.value !== "") {
      setError({ ...error, [e.target.id]: false });
      setMess({ ...mess, [e.target.id]: "" });
    }

    if (e.target.id === "password") {
      document.getElementById("retypePassword").value = "";
      //INIZIO CONDIZIONI E VALIDAZIONE PASSWORD
      let regLen = /^[a-zA-Z0-9!@#$%+?^&*]{8,32}$/g;
      let regCap = /[A-Z]+/g;
      let regSpec = /[!@#$%+?^&*]+/g;
      let val = e.target.value;

      //REGLEN
      if (val.match(regLen)) {
        pass.lenght = "✔";
        setPass(pass);
      } else {
        pass.lenght = "❌";
        setPass(pass);
      }

      //REGCAPITAL
      if (val.match(regCap)) {
        pass.capital = "✔";
        setPass(pass);
      } else {
        pass.capital = "❌";
        setPass(pass);
      }
      //REGSPECIAL
      if (val.match(regSpec)) {
        pass.special = "✔";
        setPass(pass);
      } else {
        pass.special = "❌";
        setPass(pass);
      }
      //DEVE RESTARE ALLA FINE
      setpassmess(`
     ${pass.lenght} Lenght must be between 8 and 16 characters\n
     ${pass.capital} Must contain at least a capital letter \n
     ${pass.special} Must contain at least a special: !@#$%+?^&*\n
     ${val}`);
      if (pass.capital === "✔" && pass.special === "✔" && pass.lenght === "✔") {
        setretype(false);
        setIconColor({ ...iconColor, password: "green" });
      } else {
        setretype(true);
        document.getElementById("retypePassword").value = "";
        setIconColor({ ...iconColor, password: "#ca3e47" });
      }
    }

    if (e.target.id === "email") {
      let regemail = /[a-z.0-9A-Z]{4,50}[@]{1}[a-z.A-Z]{2,20}[.]{1}[a-zA-Z]{2,10}/;
      if (!e.target.value.match(regemail)) {
        setError({ ...error, email: true });
      }
    }
    if (e.target.id === "username") {
      let regusr = /^[a-zA-Z-0-9]{4,16}$/gm;
      if (!e.target.value.match(regusr)) {
        setError({ ...error, username: true });
      }
    }

    if (e.target.id === "retypePassword") {
      if (e.target.value.length >= document.getElementById("password").value.length && e.target.value !== document.getElementById("password").value) {
        setError({ ...error, retypePassword: true });
        setMess({ ...mess, retypePassword: "Password not match" });
      }

      if (e.target.value === document.getElementById("password").value) {
        setsignbutt(false);
        setIconColor({ ...iconColor, retypePassword: "green" });
      } else {
        setsignbutt(true);
      }
    }
  };

  const handlePass = () => {
    setpassmess(`
     ${pass.lenght} Lenght must be between 8 and 16 characters \n
     ${pass.capital} Must contain at least a capital letter \n
     ${pass.special} Must contain at least a special: ~!@#$%^&*+-`);
  };
  const handleBlock = () => {
    setpassmess("");
  };

  const handleEmail = async (e) => {
    let temperr = error;
    let check;
    let email;
    if(typeof e ==="object")
    email= e.target.value
    else
    email= e

    if (email === "") {
      temperr.email = true;
      setError(temperr);
    }

    if (error.email) setMess({ ...mess, email: "Email invalid, insert a truly mail 😅" });
    else {                                                              
     await axios.get("/sign/api/getEmail", { params: { email: email },headers: {seche: process.env.REACT_APP_SECHE}} ).then((ris) => {
        check = ris.data
        if (ris.data) {
          setIconColor({ ...iconColor, email: "green" });
        } else {
          setError({ ...error, email: true });
          setIconColor({ ...iconColor, email: "#ca3e47" });
          setMess({ ...mess, email: "This email is already in use" });
        }
      });
    }
    return check
  };

  const handleUsername =async (e) => {
    let temperr = error;
    let check;
    let username

    if(typeof e ==="object")
    username = e.target.value;
    else
    username= e


    if (username === "") {
      temperr.username = true;
      setError(temperr);
    }

    if (error.username)
      setMess({
        ...mess,
        username: "This username it's beautiful but here is wrong 😫 ",
      });
    else {
     await axios.get("/sign/api/getusername", { params: { username: username },headers: {seche: process.env.REACT_APP_SECHE}}).then((ris) => {
        check = ris.data
        if (ris.data) {
          setIconColor({ ...iconColor, username: "green" });
        } else {
          setError({ ...error, username: true });
          setIconColor({ ...iconColor, username: "#ca3e47" });
          setMess({ ...mess, username: "This username is already in use" });
        }
      });
    }
    return check
  };

  const handleRetype = (e) => {
    if (e.target.value !== document.getElementById("password").value) {
      setError({ ...error, retypePassword: true });
      setMess({ ...mess, retypePassword: "Password not match" });
    }
  };

  const createpopup = () => {
    var bello= window.open('/auth/google','popup','width=600,height=600');
    var interval= setInterval(()=>{
      if(bello.closed){
       clearInterval(interval)
       window.location.reload()
     }
    }, 500)
 }
 React.useEffect(() => {
  axios.get("/auth/login/check").then((response) => {
    if (response.data) {
      console.log(response.data);
      return navigate("/dashboard");
    }
  });
}, [navigate]);


  return (
    <div>
      <Helmet>
        <style>{"body { background-color: #303030; }"}</style>

        <title>Sign up-Ultimate Notification</title>
        <meta name="title" content="Sign Up" />

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
      <div className="container align-center text-center">
        <div className="card-body mx-auto my-auto align-center text-center" id="signcard" style={{ backgroundColor: "white" }}>
          <div className="col">
            <Typography sx={{ textAlign: "CENTER" }} variant="h3">
              <b>Sign Up</b>
            </Typography>
            <div className="row ">
              <RoundedTextField
                variant="outlined"
                id="email"
                error={error.email}
                helperText={mess.email}
                onChange={handleChange}
                onBlur={handleEmail}
                sx={{
                  input: { color: "black" },
                  label: { color: "gray" },
                  mt: 2,
                  mx: "auto",
                  width: "80%",
                }}
                label="Email"
                placeholder="Email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: iconColor.email }} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="row mt-2">
              <RoundedTextField
                variant="outlined"
                id="username"
                onChange={handleChange}
                onBlur={handleUsername}
                error={error.username}
                helperText={mess.username}
                sx={{
                  input: { color: "black" },
                  label: { color: "gray" },
                  mt: 2,

                  width: "80%",
                  mx: "auto",
                }}
                label="Username"
                placeholder="Username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: iconColor.username }} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <div className="row  mt-2">
              <OverlayTrigger placement="top" overlay={renderTooltip} trigger="focus">
                <RoundedTextField
                  variant="outlined"
                  type="password"
                  id="password"
                  onChange={handleChange}
                  error={error.password}
                  helperText={mess.password}
                  onFocus={handlePass}
                  sx={{
                    input: { color: "black" },
                    label: { color: "gray" },
                    mt: 2,
                    width: "80%",
                    mx: "auto",
                  }}
                  label="Password"
                  placeholder="Password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon sx={{ color: iconColor.password }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </OverlayTrigger>
            </div>
            <div className="row  mt-2">
              <RoundedTextField
                variant="outlined"
                type="password"
                onFocus={handleBlock}
                id="retypePassword"
                disabled={retype}
                error={error.retypePassword}
                helperText={mess.retypePassword}
                onChange={handleChange}
                onBlur={handleRetype}
                sx={{
                  input: { color: "black" },
                  label: { color: "gray" },
                  mt: 2,
                  width: "80%",
                  mx: "auto",
                }}
                label="Retype Password"
                placeholder="Retype Password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon sx={{ color: iconColor.retypePassword }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button sx={{ width: "30%", mt: 3, mx: "auto" }} variant="contained" size="large" disabled={signbutt} onClick={handleSubmit} style={{ borderRadius: "30px" }}>
                {submitButt}
              </Button>
            </div>
          </div>

          <div className="row">
            <Typography variant="caption" style={{ textAlign: "center", color: "grey", marginTop: "2rem" }}>
              Or login with
            </Typography>
          </div>

          <div className="row cerchi align-center text-center mt-4 ">
            <div className="bottoni text-center mx-auto">
            <Button
                style={{
                  borderRadius: "50%",
                  height: "4.2rem",
                  width: "4.2rem",
                  marginRight: "1rem",
                  marginLeft: "1rem",
                
                }}
                onClick={
                  // window.open('/auth/google','popup','width=600,height=600').addEventListener("resize",()=> {
                  //   console.log("ciao")
                  createpopup
                  // })
                }
                variant="contained"
                size="large"
              >
                <GoogleIcon />
              </Button>
            

           
              <Button
                style={{
                  borderRadius: "50%",
                  height: "4.2rem",
                  width: "4.2rem",
                  marginRight: "1rem",
                }}
                variant="contained"
                size="large"
                href= "/auth/facebook"
              >
                <FacebookIcon />
              </Button>
            

            
              <Button
                style={{
                  borderRadius: "50%",
                  height: "4.2rem",
                  width: "4.2rem",
                  marginRight: "1rem",
                }}
                variant="contained"
                href= "/auth/discord"
                size="large"
              >
                <FontAwesomeIcon style={{ fontSize: "1.5rem" }} icon={faDiscord} l />
              </Button>
            </div>
          </div>

          <div className="row align-center text-center mt-2">
            <div className="col">
              <Typography variant="caption" className="notHave">
                Just have account?
                <br />
                <Link to="/Login" className="signUp">
                  Login
                </Link>
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
