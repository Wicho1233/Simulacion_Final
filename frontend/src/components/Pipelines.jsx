import api from "../api";
import { useEffect, useState } from "react";

export default function Pipelines() {
  const [pipe, setPipe] = useState(null);

  useEffect(() => {
    api.get("pipelines/").then(r => setPipe(r.data.pipeline));
  }, []);

  if (!pipe) return null;

  return (
    <div className="card">
      <h3>Pipelines Personalizados</h3>
      <table>
        <tbody>
          {pipe.map((p, i) => (
            <tr key={i}>
              <td>{p.paso}</td>
              <td>{p.clase}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
