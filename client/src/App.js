import React, { Component, useState, useEffect } from "react";
import Sidebar from "./component/sidebar";
import { Routes, Route, BrowserRouter, Switch } from "react-router-dom";
import Home from "./routes/home.js";
import Settings from "./routes/settings";
import Message from "./routes/Message";
import Dashboard from "./Dashboard";
import Login from "./routes/login";
import Signup from "./routes/signup";
import NotFound from "./routes/404";
import Confirmation from "./routes/confirmation.js"
import Alexa from "./routes/alexaRegistration"
import ReactGA from 'react-ga';
import usePageTracking from './component/usePageTracking'
import axios from 'axios';
import {Bar} from 'react-chartjs-2'
const App = () => {
  usePageTracking()
    return (
      <div>
        <Routes>
            
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login/confirmation" element={< Confirmation />} />
            <Route path="/alexa/registration" element={< Alexa />} />
            <Route path="/prova" element={< DynamicChart />} />
            <Route path="/*" element={< NotFound />} />
            
            </Routes>
      </div>
    );
  }


  
  export const DynamicChart = () => {
    const _isMounted = React.useRef(null);
      const [chartData, setChartData]  = useState({});
      const [employeeSalary, setEmployeeSalary] = useState([]);
      const [employeeAge, setEmployeeAge] = useState([]);
  
   const Chart = () => {
          let empSal = [];
          let empAge = [];
  
          axios.get("http://dummy.restapiexample.com/api/v1/employees")
          .then(res => {
              console.log(res);
              for(const dataObj of res.data.data){
                  empSal.push(parseInt(dataObj.employee_salary));
                  empAge.push(parseInt(dataObj.employee_age ));
  
              }
              setChartData({
                  labels: empAge,
                  datasets: [{
                                               label: 'level of thicceness',
                                               data: empSal,
                                               backgroundColor: [
                                                   'rgba(255, 99, 132, 0.2)',
                                                   'rgba(54, 162, 235, 0.2)',
                                                   'rgba(255, 206, 86, 0.2)',
                                                   'rgba(75, 192, 192, 0.2)',
                                                   'rgba(153, 102, 255, 0.2)',
                                                   'rgba(255, 159, 64, 0.2)',
                                                   'rgba(255, 99, 132, 0.2)',
                                                   'rgba(54, 162, 235, 0.2)',
                                                   'rgba(255, 206, 86, 0.2)',
                                                   'rgba(75, 192, 192, 0.2)',
                                                   'rgba(153, 102, 255, 0.2)',
                                                   'rgba(255, 159, 64, 0.2)',
                                                   'rgba(255, 99, 132, 0.2)',
                                                   'rgba(54, 162, 235, 0.2)',
                                                   'rgba(255, 206, 86, 0.2)',
                                                   'rgba(75, 192, 192, 0.2)',
                                                   'rgba(153, 102, 255, 0.2)',
                                                   'rgba(255, 159, 64, 0.2)',
                                                   'rgba(255, 99, 132, 0.2)',
                                                   'rgba(54, 162, 235, 0.2)',
                                                   'rgba(255, 206, 86, 0.2)',
                                                   'rgba(75, 192, 192, 0.2)',
                                                   'rgba(153, 102, 255, 0.2)',
                                                   'rgba(255, 159, 64, 0.2)',
                                               ],
                                               borderColor: [
                                                   'rgba(255, 99, 132, 1)',
                                                   'rgba(54, 162, 235, 1)',
                                                   'rgba(255, 206, 86, 1)',
                                                   'rgba(75, 192, 192, 1)',
                                                   'rgba(153, 102, 255, 1)',
                                                   'rgba(255, 159, 64, 1)',
                                                   'rgba(255, 99, 132, 1)',
                                                   'rgba(54, 162, 235, 1)',
                                                   'rgba(255, 206, 86, 1)',
                                                   'rgba(75, 192, 192, 1)',
                                                   'rgba(153, 102, 255, 1)',
                                                   'rgba(255, 159, 64, 1)',
                                                   'rgba(255, 99, 132, 1)',
                                                   'rgba(54, 162, 235, 1)',
                                                   'rgba(255, 206, 86, 1)',
                                                   'rgba(75, 192, 192, 1)',
                                                   'rgba(153, 102, 255, 1)',
                                                   'rgba(255, 159, 64, 1)',
                                                   'rgba(255, 99, 132, 1)',
                                                   'rgba(54, 162, 235, 1)',
                                                   'rgba(255, 206, 86, 1)',
                                                   'rgba(75, 192, 192, 1)',
                                                   'rgba(153, 102, 255, 1)',
                                                   'rgba(255, 159, 64, 1)',
                                               ],
                                               borderWidth: 1
                                           }]
              });
          })
          
          .catch(err =>{
              console.log(err);
          })
          
      }
      useEffect(() => {
          Chart();
        }, []);
        return(
            <div className="App">
                <h1>Bar Chart</h1>
                <div>
                    {chartData===null ? (<p>ciao</p>): (<Bar
                      data={chartData} redraw
                      options={{
                          responsive:true,
                          title: { text: "THICCNESS SCALE", display: true },
                          scales:{
                              yAxes:{
                                  ticks:{
                                      beginAtZero: true
                                  }
                              }
                          }
                      }}
                    />)}
                </div>
            </div>
        )
  }



export default App;