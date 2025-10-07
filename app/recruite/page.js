"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, Loader, CornerDownLeft } from 'lucide-react';
import Link from 'next/link';

// Use Tailwind CSS and Lucide-React for styling and icons.

const PRIMARY_BLUE = 'rgb(30, 64, 175)'; // For the original component's branding continuity

// Mock agent information
const agent = {
    name: "Jane Doe (Recruiter)",
    status: "Online",
    avatar: "https://placehold.co/40x40/3b82f6/ffffff?text=JD",
};

// Component for a single message bubble
const MessageBubble = ({ message, isUser }) => {
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-lg space-x-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Agent Icon or Placeholder */}
                {!isUser && (
                    <img 
                        src={agent.avatar}
                        alt="Agent"
                        className="w-8 h-8 rounded-full object-cover mt-1 flex-shrink-0"
                    />
                )}
                
                {/* Message Content */}
                <div className={`p-3 rounded-2xl shadow-md transition-all duration-300 ${
                    isUser 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                    <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                    <span className={`block mt-1 text-xs ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                        {message.time}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Main Next.js Page Component
export default function LiveAgentQueryPage() {
    const [messages, setMessages] = useState([
        { id: 1, text: `Hello! You've connected to our live support channel. Please type your query below, and I will get back to you shortly.`, isUser: false, time: '10:00 AM' }
    ]);
    const [queryText, setQueryText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendQuery = (e) => {
        e.preventDefault();
        const trimmedQuery = queryText.trim();
        if (!trimmedQuery) return;

        setIsSending(true);

        // 1. Add User Message
        const now = new Date();
        const newMessage = {
            id: Date.now(),
            text: trimmedQuery,
            isUser: true,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setQueryText('');
        
        // --- Placeholder for Socket/API Connection ---
        // In a real application, you would send 'trimmedQuery' to your backend socket or API endpoint here.
        // For simulation, we add a delayed response.
        setTimeout(() => {
            setIsSending(false);
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: `Thanks for your query about "${trimmedQuery.substring(0, 30)}...". I've alerted ${agent.name} and they should respond soon!`,
                    isUser: false,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }, 2000);
        // ---------------------------------------------
    };

    const isInputDisabled = isSending || !agent.status;

    return (
        <>
        <div className="bg-gray-50">
        <div className='bg-gray-50 h-5 w-5 relative left-[7%] top-[5%]'>
                <Link href={"/"}><button  className='home bg-gray-400 hover:cursor-pointer text-white rounded-md px-1 relative left-[7%] top-[10%] '>Home</button></Link>
                </div>
        <div className="min-h-screen bg-gray-50 antialiased font-sans flex items-center justify-center p-4">
                
            <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b flex items-center justify-between" style={{ backgroundColor: PRIMARY_BLUE }}>
                    <div className="flex items-center">
                        <MessageSquare className="w-6 h-6 text-white mr-3" />
                        <h1 className="text-xl font-bold text-white">Live Agent Support</h1>
                    </div>
                    <div className="flex items-center text-sm text-white bg-blue-700/50 p-2 rounded-full px-3">
                        <div className={`w-2 h-2 rounded-full mr-2 ${agent.status === 'Online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className="font-medium">{agent.name} ({agent.status})</span>
                    </div>
                </div>

                {/* Message History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} isUser={msg.isUser} />
                    ))}
                    {isSending && (
                        <div className="flex justify-end">
                            <div className="max-w-lg p-3 rounded-2xl bg-blue-500 text-white rounded-br-sm shadow-md animate-pulse">
                                <div className="flex items-center">
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    <span className="text-sm">Sending...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendQuery} className="p-4 border-t bg-white">
                    <div className="relative flex items-center">
                        <textarea
                            value={queryText}
                            onChange={(e) => setQueryText(e.target.value)}
                            placeholder="Type your question here and press Enter to connect..."
                            className="w-full resize-none border border-gray-300 rounded-xl py-3 pl-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 text-gray-800 disabled:bg-gray-100"
                            rows="1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendQuery(e);
                                }
                            }}
                            disabled={isInputDisabled}
                        />
                        <button
                            type="submit"
                            className={`absolute right-2 p-3 rounded-full shadow-lg transition duration-200 ${
                                isInputDisabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105 active:scale-95'
                            }`}
                            disabled={isInputDisabled || queryText.trim() === ''}
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <CornerDownLeft className="w-3 h-3 mr-1" />
                        Press Enter to send. Use Shift+Enter for new line.
                    </p>
                </form>

            </div>
        </div>
        </div>
        </>
    );
}
