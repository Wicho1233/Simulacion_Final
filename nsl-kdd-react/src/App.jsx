import React, { useState, useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import './App.css'

function App() {
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({
    logistic: null,
    correlation: null,
    split: null,
    preprocessing: null,
    pipeline: null,
    evaluation: null
  })

  // Referencias para los gráficos
  const heatmapChartRef = useRef(null)
  const scatterChartRef = useRef(null)
  const splitChartTrainRef = useRef(null)
  const splitChartValRef = useRef(null)
  const splitChartTestRef = useRef(null)
  const confusionChartRef = useRef(null)

  // Manejo de carga de archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.arff')) {
        setError('Por favor, selecciona un archivo .arff')
        return
      }
      setFile(selectedFile)
      setError('')
      setResults({
        logistic: null,
        correlation: null,
        split: null,
        preprocessing: null,
        pipeline: null,
        evaluation: null
      })
    }
  }

  // Función para enviar peticiones
  const sendRequest = async (endpoint, callback, buttonText) => {
    if (!file) {
      setError('Selecciona un archivo ARFF')
      return
    }

    setLoading(true)
    const originalText = document.activeElement.textContent
    if (document.activeElement.tagName === 'BUTTON') {
      document.activeElement.textContent = 'Procesando...'
      document.activeElement.disabled = true
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en el servidor')
      }

      callback(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      if (document.activeElement.tagName === 'BUTTON') {
        document.activeElement.textContent = originalText
        document.activeElement.disabled = false
      }
    }
  }

  // Handlers para cada botón
  const handleLogistic = () => {
    sendRequest('/api/logistic/arff/', showTrainingResult, 'Regresión Logística')
  }

  const handleCorrelation = () => {
    sendRequest('/api/correlation/arff/', showCorrelationResult, 'Correlaciones')
  }

  const handleSplit = () => {
    sendRequest('/api/split/arff/', showSplitResult, 'Dividir Dataset')
  }

  const handlePreprocessing = () => {
    sendRequest('/api/preprocessing/arff/', showPreprocessingResult, 'Preprocesamiento')
  }

  const handlePipeline = () => {
    sendRequest('/api/notebook09/pipeline/', showFullPipelineResult, 'Pipeline')
  }

  const handleEvaluation = () => {
    sendRequest('/api/notebook10/evaluation/', showEvaluationResult, 'Evaluación')
  }

  // Funciones para mostrar resultados
  const showTrainingResult = (data) => {
    setResults(prev => ({
      ...prev,
      logistic: data
    }))
  }

  const showCorrelationResult = (data) => {
    setResults(prev => ({
      ...prev,
      correlation: data
    }))
    
    setTimeout(() => {
      if (data.correlation) {
        drawHeatmap(data.correlation.columns, data.correlation.matrix)
        drawScatter(data.scatter)
      }
    }, 100)
  }

  const showSplitResult = (data) => {
    setResults(prev => ({
      ...prev,
      split: data
    }))
    
    setTimeout(() => {
      if (data.histograms) {
        drawSplitChart('splitTrainChart', 'Train', data.histograms.train, splitChartTrainRef)
        drawSplitChart('splitValChart', 'Validation', data.histograms.val, splitChartValRef)
        drawSplitChart('splitTestChart', 'Test', data.histograms.test, splitChartTestRef)
      }
    }, 100)
  }

  const showPreprocessingResult = (data) => {
    setResults(prev => ({
      ...prev,
      preprocessing: data
    }))
  }

  const showFullPipelineResult = (data) => {
    setResults(prev => ({
      ...prev,
      pipeline: data
    }))
  }

  const showEvaluationResult = (data) => {
    setResults(prev => ({
      ...prev,
      evaluation: data
    }))
    
    setTimeout(() => {
      if (data.confusion_matrix) {
        drawConfusionChart(data.confusion_matrix)
      }
    }, 100)
  }

  // Funciones para dibujar gráficos
  const drawHeatmap = (labels, matrix) => {
    const ctx = document.getElementById('corrHeatmap')
    if (!ctx) return

    if (heatmapChartRef.current) {
      heatmapChartRef.current.destroy()
    }

    // Limitar a 9 columnas
    const limitedLabels = labels.slice(0, 9)
    const limitedMatrix = matrix.slice(0, 9).map(row => row.slice(0, 9))

    heatmapChartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: limitedLabels,
        datasets: limitedMatrix.map((row, i) => ({
          label: limitedLabels[i],
          data: row,
          backgroundColor: `rgba(59, 130, 246, ${0.5 + i * 0.05})`,
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }))
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Matriz de Correlación (Top 9 variables)'
          }
        }
      }
    })
  }

  const drawScatter = (scatterData) => {
    const ctx = document.getElementById('scatterChart')
    if (!ctx || !scatterData) return

    if (scatterChartRef.current) {
      scatterChartRef.current.destroy()
    }

    // Tomar hasta 100 datos en lugar de solo 20
    const dataLimit = Math.min(100, scatterData.same_srv_rate.length)
    const points = scatterData.same_srv_rate
      .slice(0, dataLimit)
      .map((x, i) => ({
        x: x,
        y: scatterData.dst_host_srv_count[i]
      }))

    scatterChartRef.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: `same_srv_rate vs dst_host_srv_count (${dataLimit} datos)`,
          data: points,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'same_srv_rate'
            }
          },
          y: {
            title: {
              display: true,
              text: 'dst_host_srv_count'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return `same_srv_rate: ${context.parsed.x.toFixed(3)}, dst_host_srv_count: ${context.parsed.y}`
              }
            }
          }
        }
      }
    })
  }

  const drawSplitChart = (canvasId, label, histData, chartRef) => {
    const ctx = document.getElementById(canvasId)
    if (!ctx) return

    if (chartRef.current) {
      chartRef.current.destroy()
    }

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: histData.labels,
        datasets: [{
          label,
          data: histData.values,
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }

  const drawConfusionChart = (cm) => {
    const ctx = document.getElementById('confusionChart')
    if (!ctx) return

    if (confusionChartRef.current) {
      confusionChartRef.current.destroy()
    }

    confusionChartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Verdaderos Negativos', 'Falsos Positivos', 'Falsos Negativos', 'Verdaderos Positivos'],
        datasets: [{
          label: 'Matriz de Confusión',
          data: [cm.tn, cm.fp, cm.fn, cm.tp],
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(59, 130, 246, 0.7)'
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)',
            'rgb(59, 130, 246)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }

  // Función para descargar archivos
  const downloadFile = (type) => {
    window.open(`http://127.0.0.1:8000/api/download/${type}/`, '_blank')
  }

  // Limpiar gráficos al desmontar
  useEffect(() => {
    return () => {
      if (heatmapChartRef.current) heatmapChartRef.current.destroy()
      if (scatterChartRef.current) scatterChartRef.current.destroy()
      if (splitChartTrainRef.current) splitChartTrainRef.current.destroy()
      if (splitChartValRef.current) splitChartValRef.current.destroy()
      if (splitChartTestRef.current) splitChartTestRef.current.destroy()
      if (confusionChartRef.current) confusionChartRef.current.destroy()
    }
  }, [])

  return (
    <div className="container">
      <header className="app-header">
        <h1>Proyecto Final Simulacion</h1>
        <p className="subtitle">Sube un archivo <strong>.arff</strong> </p>
      </header>

      {/* SUBIDA DE ARCHIVO */}
      <div className="file-upload-section">
        <div className="file-input-wrapper">
          <input 
            type="file" 
            id="fileInput" 
            accept=".arff"
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="fileInput" className="file-input-label">
            Seleccionar archivo .arff
          </label>
        </div>
        {file && (
          <div className="file-info">
            <p><strong>Archivo seleccionado:</strong> {file.name}</p>
            <p><strong>Tamaño:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </div>

      {/* BOTONES */}
      <div className="action-buttons">
        <button 
          onClick={handleLogistic} 
          className="action-btn btn-primary"
          disabled={!file || loading}
        >
          Regresión Logística (05)
        </button>
        
        <button 
          onClick={handleCorrelation} 
          className="action-btn btn-secondary"
          disabled={!file || loading}
        >
          Correlaciones (06)
        </button>
        
        <button 
          onClick={handleSplit} 
          className="action-btn btn-success"
          disabled={!file || loading}
        >
          Dividir Dataset (07)
        </button>
        
        <button 
          onClick={handlePreprocessing} 
          className="action-btn btn-warning"
          disabled={!file || loading}
        >
          Preprocesamiento (08)
        </button>
        
        <button 
          onClick={handlePipeline} 
          className="action-btn btn-info"
          disabled={!file || loading}
        >
          Pipeline Completo (09)
        </button>
        
        <button 
          onClick={handleEvaluation} 
          className="action-btn btn-danger"
          disabled={!file || loading}
        >
          Evaluación (10)
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div id="error" className="error-message">
          {error}
        </div>
      )}

      {/* NOTEBOOK 05 - REGRESIÓN LOGÍSTICA */}
      {results.logistic && (
        <div className="section">
          <h2>Resultados - Regresión Logística</h2>
          <div className="result-card">
            <div className="metric-grid">
              <div className="metric-item">
                <span className="metric-label">Accuracy</span>
                <span className="metric-value">{results.logistic.accuracy}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Muestras Train</span>
                <span className="metric-value">{results.logistic.train_samples}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Muestras Test</span>
                <span className="metric-value">{results.logistic.test_samples}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Atributos</span>
                <span className="metric-value">{results.logistic.features_after_encoding}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTEBOOK 06 - CORRELACIÓN */}
      {results.correlation && (
        <>
          <div className="section">
            <h2>Matriz de Correlación (Top 9 variables)</h2>
            <div className="chart-container">
              <canvas id="corrHeatmap"></canvas>
            </div>

            <h3>Tabla de Correlación</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Variable</th>
                    {results.correlation.correlation?.columns.slice(0, 9).map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.correlation.correlation?.matrix.slice(0, 9).map((row, i) => (
                    <tr key={i}>
                      <td className="variable-name"><strong>{results.correlation.correlation.columns[i]}</strong></td>
                      {row.slice(0, 9).map((value, j) => (
                        <td key={j} className={Math.abs(value) > 0.7 ? 'high-correlation' : Math.abs(value) > 0.4 ? 'medium-correlation' : 'low-correlation'}>
                          {value.toFixed(3)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <h2>Scatter Plot: same_srv_rate vs dst_host_srv_count</h2>
            <div className="chart-container">
              <canvas id="scatterChart"></canvas>
            </div>

            <h3>Datos del Scatter Plot (primeros 20 datos)</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>same_srv_rate</th>
                    <th>dst_host_srv_count</th>
                  </tr>
                </thead>
                <tbody>
                  {results.correlation.scatter?.same_srv_rate.slice(0, 20).map((rate, i) => (
                    <tr key={i}>
                      <td>{rate.toFixed(3)}</td>
                      <td>{results.correlation.scatter.dst_host_srv_count[i]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* NOTEBOOK 07 - DIVISIÓN DE DATASET */}
      {results.split && (
        <div className="section">
          <h2>División del Dataset</h2>
          
          <div className="split-stats">
            <div className="stat-item">
              <span className="stat-label">Train</span>
              <span className="stat-value">{results.split.train_size}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Validation</span>
              <span className="stat-value">{results.split.val_size}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Test</span>
              <span className="stat-value">{results.split.test_size}</span>
            </div>
          </div>

          <h3>Distribución protocol_type - Train</h3>
          <div className="chart-container">
            <canvas id="splitTrainChart"></canvas>
          </div>

          <h3>Distribución protocol_type - Validation</h3>
          <div className="chart-container">
            <canvas id="splitValChart"></canvas>
          </div>

          <h3>Distribución protocol_type - Test</h3>
          <div className="chart-container">
            <canvas id="splitTestChart"></canvas>
          </div>

          <h3>Descargar conjuntos</h3>
          <div className="download-buttons">
            <button onClick={() => downloadFile('train')} className="download-btn">
              Descargar Train (.arff)
            </button>
            <button onClick={() => downloadFile('val')} className="download-btn">
              Descargar Validation (.arff)
            </button>
            <button onClick={() => downloadFile('test')} className="download-btn">
              Descargar Test (.arff)
            </button>
          </div>
        </div>
      )}

      {/* NOTEBOOK 08 - PREPROCESAMIENTO */}
      {results.preprocessing && (
        <div className="section">
          <h2>Preprocesamiento y Escalado</h2>

          <div className="info-box">
            <p><strong>Filas escaladas:</strong> {results.preprocessing.rows}</p>
          </div>

          <h3>X_train_scaled.head(10)</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>src_bytes</th>
                  <th>dst_bytes</th>
                </tr>
              </thead>
              <tbody>
                {results.preprocessing.head?.map((row, i) => (
                  <tr key={i}>
                    <td>{row.src_bytes}</td>
                    <td>{row.dst_bytes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NOTEBOOK 09 - PIPELINE */}
      {results.pipeline && (
        <div className="section">
          <h2>Pipeline Completo</h2>

          <div className="info-box">
            <div className="info-item">
              <strong>Total de filas:</strong> {results.pipeline.train_rows}
            </div>
            <div className="info-item">
              <strong>Total de atributos finales:</strong> {results.pipeline.features_after_pipeline}
            </div>
          </div>

          <h3>Dataset procesado - head()</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {results.pipeline.head && results.pipeline.head[0] && 
                    Object.keys(results.pipeline.head[0]).slice(0, 9).map(key => (
                      <th key={key}>{key}</th>
                    ))
                  }
                </tr>
              </thead>
              <tbody>
                {results.pipeline.head?.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).slice(0, 9).map((value, j) => (
                      <td key={j}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NOTEBOOK 10 - EVALUACIÓN */}
      {results.evaluation && (
        <div className="section">
          <h2>Evaluación de Resultados</h2>

          <h3>Métricas de Evaluación</h3>
          <div className="metrics-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Accuracy</td><td>{results.evaluation.metrics?.accuracy}</td></tr>
                <tr><td>Precision</td><td>{results.evaluation.metrics?.precision}</td></tr>
                <tr><td>Recall</td><td>{results.evaluation.metrics?.recall}</td></tr>
                <tr><td>F1-Score</td><td>{results.evaluation.metrics?.f1}</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Matriz de Confusión</h3>
          <div className="chart-container">
            <canvas id="confusionChart"></canvas>
          </div>

          <h3>Valores de la Matriz</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Pred Normal</th>
                  <th>Pred Ataque</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Real Normal</th>
                  <td>{results.evaluation.confusion_matrix?.tn}</td>
                  <td>{results.evaluation.confusion_matrix?.fp}</td>
                </tr>
                <tr>
                  <th>Real Ataque</th>
                  <td>{results.evaluation.confusion_matrix?.fn}</td>
                  <td>{results.evaluation.confusion_matrix?.tp}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default App