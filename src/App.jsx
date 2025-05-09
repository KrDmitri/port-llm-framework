import React from 'react'
import './App.css'
import SidePanel from './components/SidePanel'
import MainPanel from './components/MainPanel'
import ChatbotPanel from './components/ChatbotPanel'
import VesselFilePanel from './components/VesselFilePanel'
import ContainerFilePanel from './components/ContainerFilePanel'

function App() {

  return (
    <div className="app-container">
      <div className="side-panel">
        <SidePanel />
      </div>

      <div className="main-panel">
        <MainPanel />
      </div>

      <div className="chatbot-panel">
        <ChatbotPanel />
      </div>

      {/* <div className='container'>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div> */}
      
    </div>

    
  );
}

export default App
