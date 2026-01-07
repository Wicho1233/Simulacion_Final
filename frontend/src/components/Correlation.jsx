import api from "../api";
import { useEffect, useState } from "react";

export default function Correlation() {
  const [corr, setCorr] = useState(null);

  useEffect(() => {
    api.get("correlation/").then(r => setCorr(r.data.correlation_matrix));
  }, []);

  if (!corr) return null;

  return (
    <div className="card">
      <h3>Matriz de Correlación (resumen)</h3>
      <table>
        <tbody>
          {Object.keys(corr).slice(0, 10).map(k => (
            <tr key={k}>
              <td>{k}</td>
              <td>{Object.values(corr[k])[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
