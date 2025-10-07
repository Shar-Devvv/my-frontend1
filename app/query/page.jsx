"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { Send, MessageSquare, Loader, CornerDownLeft, Zap } from 'lucide-react';

const PRIMARY_BLUE = '#1e40af'; // Tailwind blue-700
// Note: AGENT_ID must match the ID used in the backend to identify recruiter messages
const AGENT_ID = 'recruiter-jane'; 
const USER_ID = 'User-' + Math.random().toString(36).substring(2, 9); // Unique ID for the current user client
const SOCKET_URL = '/'; 

// --- SOCKET CONNECTION STATE ---
let socket;

// Component for a single message bubble
const MessageBubble = ({ message, isCurrentUser }) => {
    // Determine if the message is from the fixed Recruiter or the temporary User
    const isAgent = message.senderId === AGENT_ID;
    const senderInitial = isAgent ? 'R' : 'U';

    return (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-lg space-x-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar/Initial */}
                {!isCurrentUser && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-1">
                        {senderInitial}
                    </div>
                )}
                
                {/* Message Content */}
                <div className={`p-3 rounded-2xl shadow-md transition-all duration-300 ${
                    isCurrentUser 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                    <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                    <span className={`block mt-1 text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                        {message.time}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Main Next.js Page Component
export default function LiveChatPage() {
    const [messages, setMessages] = useState([]);
    const [queryText, setQueryText] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const messagesEndRef = useRef(null);

    // Initial connection setup
    const socketInitializer = useCallback(async () => {
        try {
            // 1. Trigger the Next.js API route to spin up the Socket.io server
            await fetch(SOCKET_URL + 'api/socket'); 
            
            // 2. Connect the client to the newly started server
            socket = io(SOCKET_URL, {
                path: '/api/socket'
            });

            // Event Listeners
            socket.on('connect', () => {
                console.log('Socket Connected. User ID:', USER_ID);
                setSocketConnected(true);
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now(), text: `✅ Connected. Your session ID: ${USER_ID}. Recruiter is online.`, senderId: AGENT_ID, time: 'Now' }
                ]);
            });

            socket.on('disconnect', () => {
                console.log('Socket Disconnected.');
                setSocketConnected(false);
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now() + 1, text: '🔴 Disconnected. Please refresh to reconnect.', senderId: AGENT_ID, time: 'Now' }
                ]);
            });

            // Listener for messages broadcast by the server
            socket.on('receiveMessage', (msg) => {
                console.log('Message Received:', msg);
                setMessages((prev) => [...prev, msg]);
            });
            
            // Cleanup function for when the component unmounts
            return () => {
                if (socket) {
                    socket.disconnect();
                    socket = null;
                }
            };
        } catch (error) {
            console.error("Socket initialization failed:", error);
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 2, text: `❌ Failed to connect to server. Check console for errors.`, senderId: AGENT_ID, time: 'Now' }
            ]);
        }

    }, []);

    useEffect(() => {
        const cleanup = socketInitializer();
        return () => {
             if (typeof cleanup === 'function') cleanup();
        };
    }, [socketInitializer]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendQuery = (e) => {
        e.preventDefault();
        const trimmedQuery = queryText.trim();
        if (!trimmedQuery || !socketConnected) return;

        const now = new Date();
        const newMessage = {
            id: Date.now(),
            text: trimmedQuery,
            senderId: USER_ID, // Use the unique ID of this client
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Emit the message over the socket to the server
        socket.emit('sendMessage', newMessage);

        // Update local state immediately
        setMessages(prev => [...prev, newMessage]);
        setQueryText('');
    };

    const isInputDisabled = !socketConnected;

    return (
        <div className="min-h-screen bg-gray-50 antialiased font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden">
                
                {/* Header */}
                <div className="p-5 border-b flex items-center justify-between shadow-md" style={{ backgroundColor: PRIMARY_BLUE }}>
                    <div className="flex items-center">
                        <MessageSquare className="w-6 h-6 text-white mr-3" />
                        <h1 className="text-xl font-bold text-white">Live Recruiter Chat</h1>
                    </div>
                    <div className="flex items-center text-sm text-white bg-blue-700/50 p-2 rounded-full px-3">
                        <div className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className="font-medium">
                            {socketConnected ? 'Connected' : 'Connecting...'}
                        </span>
                        <Zap className="w-4 h-4 ml-2" />
                    </div>
                </div>

                {/* Message History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                    {messages.map(msg => (
                        // Check if the message originated from this specific client instance
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isCurrentUser={msg.senderId === USER_ID} 
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendQuery} className="p-4 border-t bg-white">
                    <div className="relative flex items-center">
                        <textarea
                            value={queryText}
                            onChange={(e) => setQueryText(e.target.value)}
                            placeholder={isInputDisabled ? "Connecting to server..." : "Type your message and press Enter..."}
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
                            {isInputDisabled ? <Loader className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <CornerDownLeft className="w-3 h-3 mr-1" />
                        Press Enter to send. **Open this page in two windows to chat.**
                    </p>
                </form>

            </div>
        </div>
    );
}
