import React from 'react'
import './App.css'
import SidePanel from './components/SidePanel'
import MainPanel from './components/MainPanel'
import ChatbotPanel from './components/ChatbotPanel'
import { useState } from 'react';

function App() {

  const [vesselCsvData, setVesselCsvData] = useState(null);
  const [containerCsvData, setContainerCsvData] = useState(null);

  return (
    <div className="app-container">
      <div className="side-panel">
        <SidePanel onVesselDataParsed={setVesselCsvData} onContainerDataParsed={setContainerCsvData}/>
      </div>

      <div className="main-panel">
        <MainPanel 
          vesselData={vesselCsvData}
          containerData={containerCsvData}
        />
      </div>

      <div className="chatbot-panel">
        <ChatbotPanel />
      </div>
      
    </div>

    
  );
}

export default App
