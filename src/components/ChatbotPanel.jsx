// import React, { useState, useEffect, useRef } from 'react';
// import '../css/ChatbotPanel.css';

// function ChatbotPanel() {
//     const [messages, setMessages] = useState(() => {
//         const saved = localStorage.getItem('chatMessages');
//         return saved ? JSON.parse(saved) : [];
//     });
//     const [input, setInput] = useState('');
//     const messagesEndRef = useRef(null);

//     // 1. 저장된 메시지 불러오기
//     useEffect(() => {
//         const savedMessages = localStorage.getItem('chatMessages');
//         if (savedMessages) {
//             setMessages(JSON.parse(savedMessages));
//         }
//     }, []);

//     // 2. 메시지 변경 시 저장
//     useEffect(() => {
//         localStorage.setItem('chatMessages', JSON.stringify(messages));
//     }, [messages]);

//     // 3. 자동 스크롤
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     const handleInputChange = (e) => {
//         setInput(e.target.value);
//     };

//     const handleSendMessage = () => {
//         if (!input.trim()) return;

//         const newMessages = [...messages, { user: 'user', text: input }];
//         setMessages(newMessages);
//         setInput('');

//         // GPT 응답 시뮬레이션
//         setTimeout(() => {
//             setMessages(prev => [
//                 ...prev,
//                 { user: 'gpt', text: input }
//             ]);
//         }, 500);
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === 'Enter') {
//             handleSendMessage();
//         }
//     };

//     const handleSubmit = e => {
//         e.preventDefault();
//         handleSendMessage();
//     };

//     return (
//         <div className="chatbot-panel">
//             <div className="chatbot-messages">
//                 {messages.map((msg, index) => (
//                     <div key={index} className={`message ${msg.user}`}>
//                         <span className="bubble">{msg.text}</span>
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>
//             <form className="chatbot-input" onSubmit={handleSubmit}>
//                 <input
//                     type="text"
//                     value={input}
//                     onChange={handleInputChange}
//                     placeholder="Type your message..."
//                 />
//                 <button type="submit">Send</button>
//             </form>
//         </div>
//     );
// }

// export default ChatbotPanel;



import React, { useState, useEffect, useRef } from 'react';
import '../css/ChatbotPanel.css';

function ChatbotPanel() {
  // 항상 빈 배열로 시작
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = e => {
    setInput(e.target.value);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // 유저 메시지 추가
    setMessages(prev => [
      ...prev,
      { user: 'user', text: input }
    ]);
    setInput('');

    // GPT 응답 시뮬레이션
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { user: 'gpt', text: input }
      ]);
    }, 500);
  };

  const handleSubmit = e => {
    e.preventDefault();       // form 기본 동작 막기
    handleSendMessage();      // 메시지 전송
  };

  return (
    <div className="chatbot-panel">
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.user}`}>
            <span className="bubble">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatbotPanel;
