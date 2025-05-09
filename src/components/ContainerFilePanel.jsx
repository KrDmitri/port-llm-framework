import React, { useState } from 'react';

export default function ContainerFilePanel({ onFileUpload }) {
  const [file, setFile] = useState(null);

  const handleChange = e => {
    const selected = e.target.files[0];
    setFile(selected);
    onFileUpload?.(selected);
  };

  const clearFile = () => {
    setFile(null);
    onFileUpload?.(null);
  };

  return (
    <div className="file-panel">
      this is ContainerFilePanel
      <input
        type="file"
        accept="*"
        onChange={handleChange}
        className="file-input"
      />
      {file && (
        <div className="file-info">
          <span className="file-name">{file.name}</span>
          <button onClick={clearFile} className="clear-button">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
