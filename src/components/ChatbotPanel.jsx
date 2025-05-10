import React, { useState, useEffect, useRef } from 'react';
import '../css/ChatbotPanel.css';

function ChatbotPanel() {
    const [messages, setMessages] = useState(() => {
		const saved = localStorage.getItem('chatMessages');
		return saved ? JSON.parse(saved) : [];
	});
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    // 1. 저장된 메시지 불러오기
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, []);

    // 2. 메시지 변경 시 저장
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    // 3. 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSendMessage = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { user: 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        // GPT 응답 시뮬레이션
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                { user: 'gpt', text: input }
            ]);
        }, 500);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="chatbot-panel">
            <div className="chatbot-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.user}`}>
                        <span className="bubble">{msg.text}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chatbot-input">
                <input 
                    type="text" 
                    value={input} 
                    onChange={handleInputChange} 
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..." 
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}

export default ChatbotPanel;
