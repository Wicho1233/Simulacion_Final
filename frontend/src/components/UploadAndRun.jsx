import { useState } from "react";
import api from "../api";

export default function UploadAndRun({ onFinish }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAll = async () => {
    if (!file) {
      alert("Selecciona un archivo ARFF");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      await api.post("upload/", form);
      await api.get("accuracy/");
      await api.get("correlation/");
      await api.get("split/");
      await api.get("scaling/");
      await api.get("pipelines/");
      await api.get("predict/");

      onFinish();
    } catch (e) {
      alert("Error durante el procesamiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Cargar Dataset ARFF</h3>

      <input
        type="file"
        accept=".arff"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={runAll} disabled={loading}>
        {loading ? "Procesando..." : "Iniciar análisis"}
      </button>

      <p>
        El análisis completo se ejecuta automáticamente después de iniciar.
      </p>
    </div>
  );
}

