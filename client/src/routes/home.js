/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import Grafico from "../component/chart";
import Switch from "@mui/material/Switch";
import Sidebar from "../component/sidebar";
import Backdrop from "@mui/material/Backdrop";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Helmet } from "react-helmet";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
const axios = require("axios").default;

export default function Home() {
  const [sessData, setSessData] = React.useState({});
  const [checked, setChecked] = React.useState({
    telegram: false,
    discord: false,
  });
  const [open, setOpen] = React.useState(true);

  const [notThisMonth, setnotThisMonth] = React.useState(0)
  const [totalNot, setTotalNot] = React.useState(0)

  const handleChange = (event) => {
    axios.post("/api/checkedChange", { target: event.target.id, value: event.target.checked }, { headers: { seche: process.env.REACT_APP_SECHE } });
    setChecked({ ...checked, [event.target.id]: event.target.checked });
  };

  React.useEffect(() => {
    setnotThisMonth(0);
    setTotalNot(0)
    var temp=0
    var month = new Date().getMonth()
    axios.get("/api/sessionData", { headers: { seche: process.env.REACT_APP_SECHE } })
      .then((e) => {
        setSessData(e.data);
        return e.data;
      })
      .then((data) => {
        let check = {
          telegram: data.telegram.checked,
          discord: data.discord.checked,
        };

        setChecked(check);
        data.tempvar.sendnot.forEach(element => {
          temp += element
          setTotalNot(temp)
          console.log(temp)
        });
        
        setnotThisMonth(data.tempvar.sendnot[month])
      });
  }, []);

  return (
    <div className="container-sett">
      <Helmet>
        <title>Dashboard- Ultimate Notification</title>
        <meta name="title" content="Dashboard" />
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
      <div className="row"></div>
      <div className="row">
        <div className="col">
          <div className="card cacc shadow border-start-primary text-white bg-dark mb-3">
            <div className="card-body">
              <div className="card-text-bottoni">
                <i className="bi bi-discord" />
                <span>Discord</span>
              </div>
            </div>
            <div className="card-footer" style={{ textAlign: "center" }}>
              <Switch color="error" id="discord" checked={checked.discord} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card cacc shadow border-start-primary text-white bg-dark mb-3">
            <div className="card-body">
              <div className="card-text-bottoni">
                <i className="bi bi-telegram" />
                <span>Telegram</span>
              </div>
            </div>
            <div className="card-footer" style={{ textAlign: "center" }}>
              <Switch color="error" id="telegram" checked={checked.telegram} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card cacc shadow border-start-primary text-white bg-dark mb-3">
            <div className="card-body">
              <div className="card-text-bottoni">
                <img src="https://img.icons8.com/ios-glyphs/40/ffffff/amazon-alexa-logo.png" alt="alexa" />
                <span>Alexa</span>
              </div>
            </div>
            <div className="card-footer" style={{ textAlign: "center" }}>
              <Switch color="error" disabled />
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card cacc shadow border-start-primary text-white bg-dark mb-3">
            <div className="card-body">
              <div className="card-text-bottoni">
                <i className="bi bi-messenger" />
                <span>Messenger</span>
              </div>
            </div>
            <div className="card-footer" style={{ textAlign: "center" }}>
              <Switch color="error" disabled />
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col order-2 my-auto">
          <div className="card notifiche shadow border-start-primary text-white bg-dark ">
            <div className="card-body">
              <div className="card-text-notifiche">
                <span> Notification</span>
                <p>total</p>
              </div>
            </div>
            <div className="card-footer" style={{ textAlign: "center" }}>
              <span>{totalNot}</span>
            </div>
          </div>
          <div className="card notifiche shadow border-start-primary text-white bg-dark mt-5 ">
            <div className="card-body">
              <div className="card-text-notifiche">
                <span> Notification</span>
                <p>Month</p>
              </div>
            </div>
            <div className="card-footer" style={{ textAlign: "center" }}>
              <span>{notThisMonth}</span>
            </div>
          </div>
          
        </div>
        {/*-------------------------------CHART------------------------------- */}
        <div className="col-lg-9 col-xl-9 mx-auto px-auto order-1">
          <div className="card shadow mb-2">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="text-light fw-bold m-0">Notifiche inviate</h6>
            </div>
            <div className="card-body">
              <Grafico />
            </div>
          </div>
        </div>
      </div>
      {/*-------------------------------CHART FINE------------------------------- */}
    </div>
  );
}
