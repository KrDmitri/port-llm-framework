import React, { useState } from 'react';
import '../css/FilePanel.css';

export default function ContainerFilePanel({ onFileUpload }) {
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
    <div
      className="cfp-container"
      style={{ width: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', height: '100%' }}
    >
      <div className="cfp-header">
        <h3 className="cfp-title">Container File Upload</h3>
      </div>
      <div
        className="cfp-body"
        style={{ display: 'grid', placeItems: 'center', gridAutoFlow: 'column', gap: '8px' }}
      >
        <input
          id="cfp-input"
          type="file"
          accept="*"
          onChange={handleChange}
          className="cfp-input"
        />
        <label
          htmlFor="cfp-input"
          className={`cfp-label ${file ? 'has-file' : ''}`}
        >
          {file ? file.name : 'Upload container file'}
        </label>
        {file && (
          <button
            className="cfp-clear"
            onClick={clearFile}
            aria-label="Clear container file"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
