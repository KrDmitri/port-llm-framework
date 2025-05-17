import React, { useState, useEffect } from 'react';
import Papa from 'papaparse/papaparse.js';
import '../css/FilePanel.css';

export default function VesselFilePanel({ onFileUpload }) {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);  // ← 컬럼명 저장

  const handleChange = e => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      onFileUpload?.(selected);
    }
  };

  const clearFile = () => {
    setFile(null);
    onFileUpload?.(null);
  };

  useEffect(() => {
    if (!file) return setColumns([]);

    Papa.parse(file, {
      header: true,
      preview: 1,             // 첫 행(header)만 읽음
      skipEmptyLines: true,
      complete: ({ meta, errors }) => {
        if (errors.length) console.error(errors);
        setColumns(meta.fields || []);
      }
    });
  }, [file]);

  return (
    <div
      className="vfp-container"
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr', // header / content
        height: '100%'
      }}
    >
      <div className="vfp-header">
        <h3 className="vfp-title">Vessel File Upload</h3>
      </div>
  
      {/* body + columns 를 함께 묶어서 세로 가운데 정렬 */}
      <div
        className="vfp-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <div
          className="vfp-body"
          style={{
            display: 'grid',
            placeItems: 'center',
            gridAutoFlow: 'column',
            gap: '8px'
          }}
        >
          <input
            id="vfp-input"
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="vfp-input"
          />
          <label
            htmlFor="vfp-input"
            className={`vfp-label ${file ? 'has-file' : ''}`}
          >
            {file ? file.name : 'Upload vessel file'}
          </label>
          {file && (
            <button
              className="vfp-clear"
              onClick={clearFile}
              aria-label="Clear file"
            >
              ×
            </button>
          )}
        </div>
  
        {columns.length > 0 && (
          <div
            className="vfp-columns"
            style={{ 
              padding: '8px 16px',
              overflowY: 'auto',
             }}
          >
            <ul style={{ margin: '4px 0', paddingLeft: '10px', textAlign: 'left' }}>
              {columns.map(col => (
                <li key={col}>{col}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
  
}