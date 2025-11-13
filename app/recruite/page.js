"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader, CornerDownLeft } from 'lucide-react';
import Link from 'next/link';
import EmojiPicker from 'emoji-picker-react';
import { io } from 'socket.io-client';

const PRIMARY_BLUE = 'rgb(30, 64, 175)';

// IMPORTANT: Change this to match your backend URL
const SOCKET_URL = "http://my-backend-wo75.onrender.com"; // Your deployed backend
// const SOCKET_URL = "http://localhost:3000"; // For local testing

// IMPORTANT: This must match the RECRUITER_EMAIL in your backend
const RECRUITER_EMAIL = "hary123@gmail.com";

const agent = {
    name: "Recruiter",
    avatar: "https://placehold.co/40x40/3b82f6/ffffff?text=R",
};

// Component for a single message bubble
const MessageBubble = ({ message, isUser }) => {
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-lg space-x-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isUser && (
                    <img 
                        src={agent.avatar}
                        alt="Agent"
                        className="w-8 h-8 rounded-full object-cover mt-1 flex-shrink-0"
                    />
                )}
                
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

export default function LiveAgentQueryPage() {
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: `Hello! You've connected to our recruiter. Please type your query below.`, 
            isUser: false, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [queryText, setQueryText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [userId, setUserId] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const [showEmoji, setShowEmoji] = useState(false);

    // Initialize Socket.IO connection
    useEffect(() => {
        // Get or create unique user ID
        let storedUserId = localStorage.getItem('chatUserId');
        if (!storedUserId) {
            storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('chatUserId', storedUserId);
        }
        setUserId(storedUserId);

        const userName = localStorage.getItem('userName') || 'Anonymous User';
        const userEmail = localStorage.getItem('userEmail') || '';

        // Initialize socket connection
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        setSocket(socketInstance);

        // ========== SOCKET EVENT LISTENERS ==========
        
        socketInstance.on('connect', () => {
            console.log('✅ Connected to server');
            setIsConnected(true);
            
            // Join chat with recruiter - CORRECT EVENT NAME
            socketInstance.emit('user-join-chat', {
                userId: storedUserId,
                userName: userName,
                userEmail: userEmail
            });
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Disconnected from server');
            setIsConnected(false);
        });

        // Chat joined confirmation
        socketInstance.on('chat-joined', (data) => {
            console.log('✅ Chat joined:', data.message);
        });

        // Load previous chat history
        socketInstance.on('chat-history', (history) => {
            console.log('📜 Loading chat history:', history);
            if (history && history.length > 0) {
                const loadedMessages = history.map((msg, index) => ({
                    id: Date.now() + index,
                    text: msg.message,
                    isUser: msg.from === 'user',
                    time: new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                }));
                setMessages(prev => [...prev, ...loadedMessages]);
            }
        });

        // Receive message from recruiter - CORRECT EVENT NAME
        socketInstance.on('recruiter-message', (data) => {
            console.log('📩 Message from recruiter:', data);
            const newMessage = {
                id: Date.now(),
                text: data.message,
                isUser: false,
                time: new Date(data.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            };
            setMessages(prev => [...prev, newMessage]);
        });

        // Message sent confirmation
        socketInstance.on('message-sent', (data) => {
            console.log('✅ Message delivered');
        });

        // Error handling
        socketInstance.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            if (socketInstance) {
                socketInstance.off('connect');
                socketInstance.off('disconnect');
                socketInstance.off('chat-joined');
                socketInstance.off('chat-history');
                socketInstance.off('recruiter-message');
                socketInstance.off('message-sent');
                socketInstance.off('connect_error');
                socketInstance.disconnect();
            }
        };
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendQuery = (e) => {
        e.preventDefault();
        const trimmedQuery = queryText.trim();
        if (!trimmedQuery || !isConnected || !socket) return;

        setIsSending(true);

        // Add User Message to UI
        const now = new Date();
        const newMessage = {
            id: Date.now(),
            text: trimmedQuery,
            isUser: true,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setQueryText('');

        // Send message to recruiter - CORRECT EVENT NAME
        socket.emit('user-message-to-recruiter', {
            userId: userId,
            userName: localStorage.getItem('userName') || 'Anonymous User',
            message: trimmedQuery,
            timestamp: now.toISOString()
        });

        console.log('📤 Message sent:', trimmedQuery);

        setTimeout(() => {
            setIsSending(false);
        }, 500);
    };

    const isInputDisabled = isSending || !isConnected;

    return (
        <div className="bg-gray-50">
            <div className='bg-gray-50 h-5 w-5 relative left-[7%] top-[5%]'>
                <Link href={"/"}>
                    <button className='home bg-gray-400 hover:cursor-pointer text-white rounded-md px-3 py-1 relative left-[7%] top-[10%]'>
                        Home
                    </button>
                </Link>
            </div>
            
            <div className="min-h-screen bg-gray-50 antialiased font-sans flex items-center justify-center p-4">
                <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden">
                    
                    {/* Header */}
                    <div className="p-5 border-b flex items-center justify-between" style={{ backgroundColor: PRIMARY_BLUE }}>
                        <div className="flex items-center">
                            <MessageSquare className="w-6 h-6 text-white mr-3" />
                            <h1 className="text-xl font-bold text-white">Chat with Recruiter</h1>
                        </div>
                        <div className="flex items-center text-sm text-white bg-blue-700/50 p-2 rounded-full px-3">
                            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                            <span className="font-medium">{isConnected ? 'Connected' : 'Connecting...'}</span>
                        </div>
                    </div>

                    {/* Connection Status Alert */}
                    {!isConnected && (
                        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
                            <p className="text-sm text-yellow-800 text-center">
                                <Loader className="w-4 h-4 animate-spin inline mr-2" />
                                Connecting to server... Please wait.
                            </p>
                        </div>
                    )}

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
                            <button
                                type="button"
                                onClick={() => setShowEmoji(!showEmoji)}
                                className="absolute left-2 p-2 text-xl z-10"
                            >
                                😀
                            </button>

                            {showEmoji && (
                                <div className="absolute bottom-14 left-0 z-50">
                                    <EmojiPicker 
                                        onEmojiClick={(e) => {
                                            setQueryText(queryText + e.emoji);
                                            setShowEmoji(false);
                                        }}
                                    />
                                </div>
                            )}

                            <textarea
                                value={queryText}
                                onChange={(e) => setQueryText(e.target.value)}
                                placeholder={isConnected ? "Type your message..." : "Connecting to server..."}
                                className="w-full resize-none border border-gray-300 rounded-xl py-3 pl-12 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 text-gray-800 disabled:bg-gray-100"
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
    );
}