import React from "react";
import TextField from "@mui/material/TextField";
import Helmet from "react-helmet";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import PersonIcon from "@mui/icons-material/Person";
import { styled } from "@mui/material/styles";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
const axios = require("axios").default;

export default function Confirmation() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = () => {
    let temp = [];
    searchParams.forEach((val, key) => {
      temp.push(val);
    });
    let params = {
      client_id: temp[0],
      response_type: temp[1],
      state: temp[2],
      redirect_uri: temp[3],
    };
    let stringa = document.getElementById("input").value;
    axios.post("/alexa/return", { code: stringa, params: params })
    .then((e)=> {
      console.log(e)
      window.location.href= e.data
    })
  };

  return (
    <div>
      <input type="text" name="ID" id="input" />
      <input onClick={handleClick} type="button" value="Button" />
    </div>
  );
}
