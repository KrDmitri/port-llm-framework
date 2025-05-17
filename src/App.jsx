import React from 'react'
import './App.css'
import SidePanel from './components/SidePanel'
import MainPanel from './components/MainPanel'
import ChatbotPanel from './components/ChatbotPanel'
import { useState } from 'react';
import LlmGeneratedPanel from './components/LlmGeneratedPanel'

function App() {

  const [vesselCsvData, setVesselCsvData] = useState(null);
  const [containerCsvData, setContainerCsvData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPortCode, setSelectedPortCode] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      fullDate: date
    });
    // console.log(`선택된 날짜: ${date.getFullYear()}년 ${date.getMonth() + 1}월`);
  };

  // console.log('portCode:', selectedPortCode);
  


  return (
    <div className="app-container">
      <div className="header">
        <h2>HAIV PORTAL</h2>
      </div>
      <div className="side-panel">
        <SidePanel onVesselDataParsed={setVesselCsvData} onContainerDataParsed={setContainerCsvData}/>
      </div>

      <div className="main-panel">
        <MainPanel 
          vesselData={vesselCsvData}
          containerData={containerCsvData}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onPortClick={setSelectedPortCode}
          selectedPortCode={selectedPortCode}
          generatedCode={generatedCode}
        />
      </div>

      <div className="llm-generated-panel">
        <LlmGeneratedPanel 
          generatedCode={generatedCode}
          vesselData={vesselCsvData}
          selectedDate={selectedDate}
          selectedPortCode={selectedPortCode}
        />
      </div>

      <div className="chatbot-panel">
        <ChatbotPanel onNewCode={setGeneratedCode}/>
      </div>
      
    </div>

    
  );
}

export default App
