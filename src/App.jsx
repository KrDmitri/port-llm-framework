import React from 'react'
import './App.css'
import SidePanel from './components/SidePanel'
import MainPanel from './components/MainPanel'
import ChatbotPanel from './components/ChatbotPanel'
import { useState } from 'react';

function App() {

  const [vesselCsvData, setVesselCsvData] = useState(null);
  const [containerCsvData, setContainerCsvData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      fullDate: date
    });
    // console.log(`선택된 날짜: ${date.getFullYear()}년 ${date.getMonth() + 1}월`);
  };
  


  return (
    <div className="app-container">
      <div className="side-panel">
        <SidePanel onVesselDataParsed={setVesselCsvData} onContainerDataParsed={setContainerCsvData}/>
      </div>

      <div className="main-panel">
        <MainPanel 
          vesselData={vesselCsvData}
          containerData={containerCsvData}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      </div>

      <div className="chatbot-panel">
        <ChatbotPanel />
      </div>
      
    </div>

    
  );
}

export default App
