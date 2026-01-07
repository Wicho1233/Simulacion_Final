import api from "../api";
import { useEffect, useState } from "react";

export default function Scaling() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.get("scaling/").then(r => setInfo(r.data));
  }, []);

  if (!info) return null;

  return (
    <div className="card">
      <h3>Escalado del Dataset</h3>
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}
