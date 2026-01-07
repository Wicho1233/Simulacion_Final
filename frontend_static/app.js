const fileInput = document.getElementById("fileInput");
const errorDiv = document.getElementById("error");

// Función para evitar el error si el elemento no existe
function setError(msg) {
    if (errorDiv) {
        errorDiv.textContent = msg;
    } else {
        console.warn("Elemento #error no encontrado en el DOM:", msg);
    }
}

const trainBtn = document.getElementById("trainBtn");
const corrBtn = document.getElementById("corrBtn");
const splitBtn = document.getElementById("splitBtn");
const prepBtn = document.getElementById("prepBtn");
const pipelineBtn = document.getElementById("pipelineBtn");
const evalBtn = document.getElementById("evalBtn"); // Notebook 10

let heatmapChart = null;
let scatterChart = null;
let splitChartTrain = null;
let splitChartVal = null;
let splitChartTest = null;
let confusionChart = null;

/* ===========================
   BOTONES
=========================== */

trainBtn.onclick = () => sendRequest("/api/logistic/arff/", showTrainingResult);
corrBtn.onclick = () => sendRequest("/api/correlation/arff/", showCorrelationResult);
splitBtn.onclick = () => sendRequest("/api/split/arff/", showSplitResult);
prepBtn.onclick = () => sendRequest("/api/preprocessing/arff/", showPreprocessingResult);
pipelineBtn.onclick = () => sendRequest("/api/notebook09/pipeline/", showFullPipelineResult);
evalBtn.onclick = () => sendRequest("/api/notebook10/evaluation/", showEvaluationResult);

/* ===========================
   FUNCIÓN GENERAL POST
=========================== */

async function sendRequest(endpoint, callback) {
    setError(""); // Limpiar errores antes de enviar

    const file = fileInput.files[0];
    if (!file) {
        setError("Selecciona un archivo ARFF");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://127.0.0.1:8000" + endpoint, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error en el servidor");
        }

        callback(data);

    } catch (err) {
        setError(err.message);
    }
}

/* ===========================
   NOTEBOOK 05 – REGRESIÓN
=========================== */

function showTrainingResult(data) {
    document.getElementById("trainResult").innerHTML = `
        <ul>
            <li><strong>Accuracy:</strong> ${data.accuracy}</li>
            <li><strong>Train:</strong> ${data.train_samples}</li>
            <li><strong>Test:</strong> ${data.test_samples}</li>
            <li><strong>Atributos:</strong> ${data.features_after_encoding}</li>
        </ul>
    `;
}

/* ===========================
   NOTEBOOK 06 – CORRELACIÓN
=========================== */

function showCorrelationResult(data) {
    drawHeatmap(data.correlation.columns, data.correlation.matrix);
    drawScatter(data.scatter);
    drawCorrelationTable(data.correlation);
    drawScatterTable(data.scatter);
}

/* ===========================
   HEATMAP
=========================== */

function drawHeatmap(labels, matrix) {
    const ctx = document.getElementById("corrHeatmap").getContext("2d");
    if (heatmapChart) heatmapChart.destroy();

    heatmapChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: matrix.map((row, i) => ({
                label: labels[i],
                data: row
            }))
        },
        options: { responsive: true }
    });
}

/* ===========================
   SCATTER (20 DATOS)
=========================== */

function drawScatter(scatterData) {
    const ctx = document.getElementById("scatterChart").getContext("2d");
    if (scatterChart) scatterChart.destroy();

    const points = scatterData.same_srv_rate
        .slice(0, 20)
        .map((_, i) => ({
            x: scatterData.same_srv_rate[i],
            y: scatterData.dst_host_srv_count[i]
        }));

    scatterChart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "same_srv_rate vs dst_host_srv_count",
                data: points
            }]
        },
        options: { responsive: true }
    });
}

/* ===========================
   TABLAS CORRELACIÓN
=========================== */

function drawCorrelationTable(corr) {
    const table = document.getElementById("corrTable");
    table.innerHTML = "";

    const header = document.createElement("tr");
    header.innerHTML =
        `<th></th>` + corr.columns.map(c => `<th>${c}</th>`).join("");
    table.appendChild(header);

    corr.matrix.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML =
            `<td><strong>${corr.columns[i]}</strong></td>` +
            row.map(v => `<td>${v}</td>`).join("");
        table.appendChild(tr);
    });
}

function drawScatterTable(scatter) {
    const tbody = document.querySelector("#scatterTable tbody");
    tbody.innerHTML = "";

    scatter.same_srv_rate.slice(0, 20).forEach((_, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${scatter.same_srv_rate[i]}</td>
            <td>${scatter.dst_host_srv_count[i]}</td>
        `;
        tbody.appendChild(tr);
    });
}

/* ===========================
   NOTEBOOK 07 – SPLIT
=========================== */

function showSplitResult(data) {
    document.getElementById("trainSize").textContent = data.train_size;
    document.getElementById("valSize").textContent = data.val_size;
    document.getElementById("testSize").textContent = data.test_size;

    drawSplitChart("splitTrainChart", "Train", data.histograms.train, splitChartTrain);
    drawSplitChart("splitValChart", "Validation", data.histograms.val, splitChartVal);
    drawSplitChart("splitTestChart", "Test", data.histograms.test, splitChartTest);
}

function drawSplitChart(canvasId, label, histData, oldChart) {
    const ctx = document.getElementById(canvasId).getContext("2d");
    if (oldChart) oldChart.destroy();

    return new Chart(ctx, {
        type: "bar",
        data: {
            labels: histData.labels,
            datasets: [{
                label,
                data: histData.values
            }]
        },
        options: { responsive: true }
    });
}

/* ===========================
   NOTEBOOK 08 – PREPROCESAMIENTO
=========================== */

function showPreprocessingResult(data) {
    document.getElementById("prepRows").textContent = data.rows;
    const tbody = document.querySelector("#prepTable tbody");
    tbody.innerHTML = "";

    data.head.forEach(r => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${r.src_bytes}</td><td>${r.dst_bytes}</td>`;
        tbody.appendChild(tr);
    });
}

/* ===========================
   NOTEBOOK 09 – PIPELINE
=========================== */

function showFullPipelineResult(data) {
    document.getElementById("pipeRows").textContent = data.train_rows;
    document.getElementById("pipeFeatures").textContent = data.features_after_pipeline;

    const thead = document.querySelector("#pipelineTable thead");
    const tbody = document.querySelector("#pipelineTable tbody");
    thead.innerHTML = "";
    tbody.innerHTML = "";

    const header = document.createElement("tr");
    Object.keys(data.head[0]).forEach(k => header.innerHTML += `<th>${k}</th>`);
    thead.appendChild(header);

    data.head.forEach(row => {
        const tr = document.createElement("tr");
        Object.values(row).forEach(v => tr.innerHTML += `<td>${v}</td>`);
        tbody.appendChild(tr);
    });
}

/* ===========================
   NOTEBOOK 10 – EVALUACIÓN
=========================== */

function showEvaluationResult(data) {
    document.getElementById("evalAccuracy").textContent = data.metrics.accuracy;
    document.getElementById("evalPrecision").textContent = data.metrics.precision;
    document.getElementById("evalRecall").textContent = data.metrics.recall;
    document.getElementById("evalF1").textContent = data.metrics.f1;

    document.getElementById("tnCell").textContent = data.confusion_matrix.tn;
    document.getElementById("fpCell").textContent = data.confusion_matrix.fp;
    document.getElementById("fnCell").textContent = data.confusion_matrix.fn;
    document.getElementById("tpCell").textContent = data.confusion_matrix.tp;

    drawConfusionChart(data.confusion_matrix);
}

function drawConfusionChart(cm) {
    const ctx = document.getElementById("confusionChart").getContext("2d");
    if (confusionChart) confusionChart.destroy();

    confusionChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["TN", "FP", "FN", "TP"],
            datasets: [{
                label: "Matriz de Confusión",
                data: [cm.tn, cm.fp, cm.fn, cm.tp]
            }]
        },
        options: { responsive: true }
    });
}

/* ===========================
   DESCARGA ARFF
=========================== */

function downloadFile(type) {
    window.open(`http://127.0.0.1:8000/api/download/${type}/`, "_blank");
}
