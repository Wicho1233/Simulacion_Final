import api from "../api";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function Split() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("split/").then(r => setData(r.data));
  }, []);

  if (!data) return null;

  return (
    <div className="card">
      <h3>División del Dataset</h3>
      <Bar data={{
        labels: ["Train", "Validation", "Test"],
        datasets: [{
          data: [data.train_set, data.val_set, data.test_set],
          backgroundColor: ["#666", "#888", "#aaa"]
        }]
      }} />
    </div>
  );
}
