import React, * as react from "react";
import Helmet from "react-helmet";
import "./style.css";
import { Link, Outlet, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
const Sidebar = (props) => {
  React.useEffect(() => {
    const showNavbar = (toggleId, navId, bodyId, headerId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId),
    bodypd = document.getElementById(bodyId),
    headerpd = document.getElementById(headerId)
    
    // Validate that all variables exist
    if(toggle && nav && bodypd && headerpd){
    toggle.addEventListener('click', ()=>{
    // show navbar
    nav.classList.toggle('show-1')
    // change icon
    toggle.classList.toggle('bx-x')
    // add padding to body
    bodypd.classList.toggle('body-pd')
    // add padding to header
    headerpd.classList.toggle('body-pd')
    })
    }
    }
    
    showNavbar('header-toggle','nav-bar','body-pd','header')
    
    /*===== LINK ACTIVE =====*/
    const linkColor = document.querySelectorAll('.nav_link')
    function colorLink(){
    if(linkColor){
    linkColor.forEach(l=> l.classList.remove('active'))
    this.classList.add('active')
    }
    }
    linkColor.forEach(l=> l.addEventListener('click', colorLink))
    
    // Your code to run since DOM is loaded and ready

  },[] )
  
  let navigate = useNavigate()
  const handleLogout =async () => {
    axios.post('/auth/logout')
    .then(() => {
      return <Navigate to="/login"/>;
    })
    return <Navigate to="/login"/>
  }


  return (
    <div className="application">
      <Helmet>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css"
        />
      </Helmet>
      <header
        className="header"
        id="header"
        style={{ backgroundColor: "rgba(255, 0, 0,0)" }}
      >
        <div className="header_toggle">
          {" "}
          <i
            className="bx bx-menu "
            id="header-toggle"
            style={{ fontSize: "2rem", color: "white", marginRight: "50px" }}
          />{" "}
        </div>
      </header>
      <div className="l-navbar" id="nav-bar">
        <nav className="nav">
          <div>
            {/* <Link to="/dashboard/home" active="true" className="nav_logo" >
              <i className="bi bi-bell-fill" style={{ color: "white" }} />
              <span className="nav_logo-name">Ultimate Notificator</span>
            </Link> */}

            <div className="nav_list">
              <Link to="/dashboard/home" className="nav_link">
                <i className="bx bx-grid-alt nav_icon" />
                <span className="nav_name">Dashboard</span>
              </Link>

              <Link to="/dashboard/Message" className="nav_link">
                <i className="bx bx-message-square-detail nav_icon" />
                <span className="nav_name">Message</span>
              </Link>

              {/* <Link to="/dashboard/Table" className="nav_link">
                <i className="bi bi-table" />
                <span className="nav_name">Table</span>
              </Link> */}

              <Link to="/dashboard/settings" className="nav_link">
                <i className="bi bi-gear-fill" />
                <span className="nav_name">Settings</span>
              </Link>
            </div>
          </div>
          <Link to="/login" onClick={handleLogout} className="btn nav_link">
            <i className="bx bx-log-out nav_icon" />
            <span className="nav_name">Logout</span>
          </Link>
        </nav>
      </div>
      <Outlet />
    </div>
  );
};

export default Sidebar;
