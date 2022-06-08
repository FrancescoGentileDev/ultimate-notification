import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
const axios = require("axios").default;
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const options = {
  animations: {
    y: {
      duration: 1000,
      easing: "easeOutBack",
      from: 100,
    },
  },
};

const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


export default function Grafico() {
  const [data, setData] = React.useState({
    labels,
    datasets: [
      {
        label: "notifiche inviate",
        data: [1,2,3,4,5,6,7,8,9,10,11,12],
        backgroundColor: "rgba(202, 62, 71, 0.4)",
        borderColor: "rgba(202, 62, 71, 1)",
        borderWidth: 2,
      },
    ],
  });

  React.useEffect(() => {
    axios.get("/api/sessionData", { headers: { seche: process.env.REACT_APP_SECHE } })
      .then((e) => {
        var not = e.data.tempvar.sendnot;
        setData({
          labels,
          datasets: [
            {
              label: "notifiche inviate",
              data: not,
              backgroundColor: "rgba(202, 62, 71, 0.4)",
              borderColor: "rgba(202, 62, 71, 1)",
              borderWidth: 2,
            },
          ],
        })
      })
  },[])


  return <Bar options={options} data={data} />;
}
