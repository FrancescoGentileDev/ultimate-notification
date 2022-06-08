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
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import PersonIcon from "@mui/icons-material/Person";
import { styled } from "@mui/material/styles";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useNavigate } from "react-router-dom";

export default function Confirmation() {
  return (
    <div>
      <Helmet>
        <style>{"body { background-color: #303030; }"}</style>
      </Helmet>
      <div className="container" id="issimo">
        <div className="card-body" id="confirmationCard" style={{ backgroundColor: "white", borderRadius: "30px" }}>
          <Typography >
            <b>SIGN UP SUCCESS!😊🚀</b> <br />
            <b>CHECK YOUR MAIL TO CONFIRM YOUR ACCOUNT <br/> <p style={{ fontSize:"0.75rem"}}>⏲YOU HAVE 30 MINUTE BEFORE AUTODETRUCTION⏲</p></b> <br />
          </Typography>
          <Link to="/login">
            <Button sx={{mx: "auto", mt: 5 }} variant="contained" size="large" style={{ width: "100%", borderRadius: "15px" }}>
              LOGIN
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
