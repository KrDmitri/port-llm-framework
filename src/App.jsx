import React from 'react'
import './App.css'
import SidePanel from './components/SidePanel'
import MainPanel from './components/MainPanel'
import ChatbotPanel from './components/ChatbotPanel'

function App() {

  return (
    // app-container는 웹 브라우저 가운데 정렬하고 위 아래 여백
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
    </div>
  );
}

export default App
