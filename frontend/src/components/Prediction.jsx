import api from "../api";
import { useEffect, useState } from "react";

export default function Prediction() {
  const [pred, setPred] = useState(null);

  useEffect(() => {
    api.get("predict/").then(r => setPred(r.data.predicciones));
  }, []);

  if (!pred) return null;

  return (
    <div className="card">
      <h3>Predicción Final</h3>
      <pre>{JSON.stringify(pred, null, 2)}</pre>
    </div>
  );
}
