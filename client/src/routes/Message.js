/* eslint-disable no-unused-vars */
import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import "./settings.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDiscord,
  faFacebookMessenger,
  faTelegramPlane,
} from "@fortawesome/free-brands-svg-icons";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
/*import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { color } from '@mui/system';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Input from '@mui/material/Input';
import Fade from '@mui/material/Fade';*/
import Telegramnot from "../component/telegramNot";
import DiscordNot from "../component/stylediscord/discordNot";
import Sidebar from "../component/sidebar";
import { Helmet } from "react-helmet";
const axios = require("axios").default;


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {


  const [value, setValue] = React.useState(0);

  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  
  return (
    <div className="col-auto">
      <Helmet>
        <title>Message- Ultimate Notification</title>
        <meta name="title" content="Message" />

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
      <Box sx={{ borderBottom: 2, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<FontAwesomeIcon icon={faTelegramPlane} />}
            iconPosition="start"
            className="tabs"
            sx={{ mx: "auto" }}
            label="Telegram"
            {...a11yProps(0)}
          />
          <Tab
            icon={<FontAwesomeIcon icon={faDiscord} />}
            iconPosition="start"
            className="tabs"
            sx={{ mx: "auto" }}
            label="Discord"
            {...a11yProps(1)}
          />
          <Tab
            icon={<FontAwesomeIcon icon={faFacebookMessenger} />}
            iconPosition="start"
            className="tabs"
            sx={{ mx: "auto" }}
            label="Messenger"
            disabled
            {...a11yProps(2)}
          />
          <Tab
            icon={
              <img
                src="https://img.icons8.com/ios-glyphs/40/ffffff/amazon-alexa-logo.png"
                alt="alexa"
              />
            }
            iconPosition="start"
            className="tabs alexa"
            sx={{ mx: "auto" }}
            label="Alexa"
            disabled
            {...a11yProps(2)}
          />
        </Tabs>
      </Box>
      <Collapse timeout={"auto"} in={value === 0}>
        <TabPanel value={value} index={0}>
          <Telegramnot
            index={"start"}
            title="START NOTIFICATION"
            
          />
          <hr />
          <Telegramnot
            index={"mid"}
            title="CHANGE GAME NOTIFICATION"
            
          />
          <hr />
          <Telegramnot
            index={"end"}
            title="END STREAM NOTIFICATION"
            
          />
        </TabPanel>
      </Collapse>
      <Collapse timeout={"auto"} in={value === 1}>
        <TabPanel value={value} index={1}>
          <DiscordNot
            index={"start"}
            title="START NOTIFICATION"
            
          />
          <hr />
          <DiscordNot
            index={"mid"}
            title="CHANGE GAME NOTIFICATION"
           
          />
          <hr />
          <DiscordNot
            index={"end"}
            title="END STREAM NOTIFICATION"
           
          />
        </TabPanel>
      </Collapse>
      <Collapse timeout={"auto"} in={value === 2}>
        <TabPanel value={value} index={2}>
          <div className="col-auto">
            <div className="card"></div>
          </div>
        </TabPanel>
      </Collapse>
      <Collapse timeout={"auto"} in={value === 3}>
        <TabPanel value={value} index={3}>
          <div className="col-auto">
            <div className="card"></div>
          </div>
        </TabPanel>
      </Collapse>
    </div>
  );
}
