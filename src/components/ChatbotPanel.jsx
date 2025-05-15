// import React, { useState, useEffect, useRef } from 'react';
// import '../css/ChatbotPanel.css';

// function ChatbotPanel() {
//   // 항상 빈 배열로 시작
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const messagesEndRef = useRef(null);

//   // 자동 스크롤
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleInputChange = e => {
//     setInput(e.target.value);
//   };

//   const handleSendMessage = () => {
//     if (!input.trim()) return;

//     // 유저 메시지 추가
//     setMessages(prev => [
//       ...prev,
//       { user: 'user', text: input }
//     ]);
//     setInput('');

//     // GPT 응답 시뮬레이션
//     setTimeout(() => {
//       setMessages(prev => [
//         ...prev,
//         { user: 'gpt', text: input }
//       ]);
//     }, 500);
//   };

//   const handleSubmit = e => {
//     e.preventDefault();       // form 기본 동작 막기
//     handleSendMessage();      // 메시지 전송
//   };

//   return (
//     <div className="chatbot-panel">
//       <div className="chatbot-messages">
//         {messages.map((msg, i) => (
//           <div key={i} className={`message ${msg.user}`}>
//             <span className="bubble">{msg.text}</span>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       <form className="chatbot-input" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={input}
//           onChange={handleInputChange}
//           placeholder="Type your message..."
//         />
//         <button type="submit">Send</button>
//       </form>
//     </div>
//   );
// }

// export default ChatbotPanel;


import React, { useState, useEffect, useRef } from 'react';
import '../css/ChatbotPanel.css';

function ChatbotPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    // 유저 메시지 추가
    setMessages(prev => [...prev, { user: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chatbot/get-answer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // GPT 응답 추가
      setMessages(prev => [...prev, { user: 'gpt', text: data.answer }]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages(prev => [
        ...prev,
        { user: 'gpt', text: '죄송합니다. 응답을 불러오는데 실패했습니다.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="chatbot-panel">
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.user}`}>
            <span className="bubble">{msg.text}</span>
          </div>
        ))}
        {/* {loading && (
          <div className="message gpt">
            <span className="bubble">응답을 기다리는 중...</span>
          </div>
        )} */}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatbotPanel;
