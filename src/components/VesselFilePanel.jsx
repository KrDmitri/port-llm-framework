import React, { useState } from 'react';
import '../css/FilePanel.css';

export default function VesselFilePanel({ onFileUpload }) {
  const [file, setFile] = useState(null);

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

  return (
    <div className="vfp-container" style={{ width: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', height: '100%' }}>
      <div className="vfp-header">
        <h2 className="vfp-title">Vessel File Upload</h2>
      </div>
      <div className="vfp-body" style={{ display: 'grid', placeItems: 'center', gridAutoFlow: 'column', gap: '8px' }}>
        <input
          id="vfp-input"
          type="file"
          accept="*"
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
    </div>
  );
}