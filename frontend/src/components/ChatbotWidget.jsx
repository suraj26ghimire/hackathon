import React, { useState } from 'react';
import api from '../services/api';
import { MessageCircle, X, Send } from 'lucide-react';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ text: "Hi! How can I help you find scholarships today?", isBot: true }]);
    const [input, setInput] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { text: input, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const res = await api.post('chatbot/', { query: userMsg.text });
            setMessages(prev => [...prev, { text: res.data.response, isBot: true }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isBot: true }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-surface rounded-2xl shadow-2xl w-80 h-96 flex flex-col overflow-hidden border border-gray-200">
                    <div className="bg-primary text-white p-4 flex justify-between items-center">
                        <span className="font-semibold">AI Assistant</span>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3 bg-background">
                        {messages.map((msg, i) => (
                            <div key={i} className={`max-w-[80%] p-3 rounded-lg ${msg.isBot ? 'bg-surface text-text self-start border border-gray-200 rounded-tl-none shadow-sm' : 'bg-primary text-white self-end rounded-tr-none shadow-sm'}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    
                    <form onSubmit={sendMessage} className="p-3 bg-surface border-t border-gray-200 flex">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask something..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button type="submit" className="bg-primary text-white px-3 py-2 rounded-r-lg hover:bg-primary-dark">
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition transform hover:scale-105"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default ChatbotWidget;
