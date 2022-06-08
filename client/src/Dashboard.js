import * as React from "react";
import Sidebar from "./component/sidebar";
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Home from "./routes/home.js";
import Settings from "./routes/settings";
import Message from "./routes/Message";
import Helmet from "react-helmet";
import axios from "axios";

export default function Dashboard() {
  let navigate = useNavigate();
  

  React.useEffect(() => {
    axios.get("/auth/login/check").then((response) => {
      if (!response.data) return navigate("/login");
    });
})

  
  return (
    <div>
      <Helmet>
        <style>{"body { background-color: #525252; }"}</style>
      </Helmet>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="home" />} />
        <Route path="home" element={<Home />} />
        <Route path="settings" element={<Settings />} />
        <Route path="message" element={<Message />} />
        <Route path="table" element={<div>TABLE</div>} />
        
        <Route path="/*" element={<div>404</div>} />
      </Routes>
    </div>
  );




}

export function Logout() {
  let navigate = useNavigate();
  React.useEffect(() => {
    axios.get("/auth/logout").then(() => {
      return navigate("/login");
    });
  });

  return <Navigate to="/login" />;
}
