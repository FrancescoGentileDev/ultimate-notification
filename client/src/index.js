import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";

import "bootstrap-icons/font/bootstrap-icons.css";
import Dashboard from "./Dashboard";
import App from "./App";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    type: 'dark',
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
  },
});



ReactDOM.render(
  <ThemeProvider theme={theme}>

    <Router>
      <App />
    </Router>

  </ThemeProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

