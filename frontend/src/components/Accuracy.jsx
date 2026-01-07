import api from "../api";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function Accuracy() {
  const [acc, setAcc] = useState(null);

  useEffect(() => {
    api.get("accuracy/").then(r => setAcc(r.data.accuracy));
  }, []);

  if (!acc) return null;

  return (
    <div className="card">
      <h3>Accuracy del Modelo</h3>
      <Bar data={{
        labels: ["Accuracy"],
        datasets: [{
          data: [acc],
          backgroundColor: "#777"
        }]
      }} />
    </div>
  );
}

