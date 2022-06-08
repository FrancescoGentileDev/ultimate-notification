import React from "react";

import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Helmet from "react-helmet";

import InputAdornment from "@mui/material/InputAdornment";

import Typography from "@mui/material/Typography";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";
import "./login.css";
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

export default function Login() {
  let navigate = useNavigate();
  let errObj = {
    general: false,
    username: false,
    password: false,
  };
  let messObj = {
    general: false,
    username: "",
    password: "",
  };

  const [error, setError] = React.useState(errObj);
  const [mess, setMess] = React.useState(messObj);

  React.useEffect(() => {
    axios.get("/auth/login/check").then((response) => {
      if (response.data) {
        console.log(response.data);
        return navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handlesubmit = (e) => {
    let obj = {
      username: document.getElementById("username"),
      password: document.getElementById("password"),
    };
    let terror = { ...error };
    let tmess = { ...mess };

    /* VALIDATION OF NULL EMPTY CAMP */
    for (let elem in obj) {
      if (obj[elem].value === "") {
        terror[elem] = true;
        tmess[elem] = "Sorry but this can't be empty 😅 ";
      } else {
        terror[elem] = false;
        tmess[elem] = "";
      }
    }
    setError(terror);
    setMess(tmess);

    if (!error.username && !error.password)
      axios({
        method: "post",
        data: {
          username: obj.username.value,
          password: obj.password.value,
        },
        withCredentials: true,
        url: "/auth/login/",
      }).then((res) => {
        if (res.data.log) {
          return navigate("/dashboard");
        } else {
          if (res.data.info === "userNot") {
            setError({ ...error, username: true });
            setMess({ ...mess, username: "Email wrong 😫" });
          } else if (res.data.info === "PassWrong") {
            setError({ ...error, password: true });
            setMess({ ...mess, password: "Password wrong 😮" });
          } else if (res.data.info === "notEnabled") {
            setError({ ...error, general: true });
            setMess({ ...mess, general: "PROFILE NOT ENABLED VERIFY MAIL" });
          }
        }
      });
  };

  const handleChange = (e) => {
    if (e.target.value !== "") setError({ ...error, [e.target.id]: false });
    setMess({ ...mess, [e.target.id]: "" });
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

  return (
    <div className="main">
      <Helmet>
        <style>{"body { background-color: #303030; }"}</style>

        <title>Login- Ultimate Notification</title>
        <meta name="title" content="Login" />
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

      <div className="card-body mx-auto my-auto " id="logincard" style={{ backgroundColor: "white" }}>
        <Typography sx={{ mt: 8, textAlign: "center" }} variant="h3">
          <b>Login</b>
        </Typography>

        <div className="row">
          <RoundedTextField
            variant="outlined"
            id="username"
            error={error.username}
            helperText={mess.username}
            sx={{
              input: { color: "black" },
              label: { color: "gray" },
              mt: 5,
              width: "80%",
              mx: "auto",
            }}
            label="Email"
            placeholder="Email"
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="row">
          <RoundedTextField
            variant="outlined"
            type="password"
            helperText={mess.password}
            id="password"
            error={error.password}
            sx={{
              input: { color: "black" },
              label: { color: "gray" },
              mt: 4,
              width: "80%",
              mx: "auto",
            }}
            label="Password"
            placeholder="Password"
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PasswordIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className="row mt-2">
          <div className="col">
            <Link style={{ color: "grey" }} to="/login/forgotPassword" className="link">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="row" style={{ textAlign: "center" }}>
          <Typography style={{ color: "red", marginTop: "1rem" }}>
            <b>{mess.general}</b>
          </Typography>
          <Button sx={{ width: "40%", mx: "auto", mt: 3 }} variant="contained" size="large" style={{ borderRadius: "30px" }} onClick={handlesubmit}>
            LOGIN
          </Button>
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
                <FontAwesomeIcon style={{ fontSize: "1.5rem" }} icon={faDiscord} />
              </Button>
            
          </div>
        </div>

        <div className="row align-center text-center mt-4">
          <div className="col">
            <Typography variant="caption" className="notHave">
              Don't have account?
              <br />
              <Link to="/signup" className="signUp">
                Sign up
              </Link>
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
