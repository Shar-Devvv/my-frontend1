"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Users, Circle, Home, LogOut } from 'lucide-react';
import { io } from 'socket.io-client';
import Link from 'next/link';

// SOCKET CONNECTION - Change to your backend URL
const socket = io("https://my-backend-wo75.onrender.com");

// RECRUITER CREDENTIALS - IMPORTANT: Change these to match your backend!
const RECRUITER_EMAIL = "hary123@gmail.com";
const RECRUITER_NAME = "Jane Doe";

export default function RecruiterDashboard() {
    const [users, setUsers] = useState([]); // All users who contacted
    const [selectedUser, setSelectedUser] = useState(null); // Currently selected user
    const [messages, setMessages] = useState([]); // Messages with selected user
    const [replyText, setReplyText] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // ========== SOCKET EVENTS ==========
        
        socket.on('connect', () => {
            console.log('✅ Recruiter connected to server');
            setIsConnected(true);
            
            // Auto-login as recruiter
            socket.emit('recruiter-login', {
                recruiterEmail: RECRUITER_EMAIL,
                recruiterName: RECRUITER_NAME
            });
        });

        socket.on('disconnect', () => {
            console.log('❌ Recruiter disconnected from server');
            setIsConnected(false);
            setIsLoggedIn(false);
        });

        // After successful login, receive all users and their messages
        socket.on('recruiter-logged-in', (data) => {
            console.log('✅ Recruiter logged in successfully:', data);
            setIsLoggedIn(true);
            setUsers(data.activeUsers);
            
            // Auto-select first user if available
            if (data.activeUsers.length > 0 && !selectedUser) {
                selectUser(data.activeUsers[0]);
            }
        });

        // Failed login
        socket.on('login-failed', (data) => {
            alert(`Login Failed: ${data.message}`);
            console.error('❌ Login failed:', data.message);
            setIsLoggedIn(false);
        });

        // New message from any user
        socket.on('new-user-message', (data) => {
            console.log('📩 New message from user:', data);
            
            // Update user list
            setUsers(prevUsers => {
                const userExists = prevUsers.find(u => u.userId === data.userId);
                
                const newMessage = {
                    message: data.message,
                    from: 'user',
                    userName: data.userName,
                    timestamp: data.timestamp
                };
                
                if (!userExists) {
                    // Add new user
                    return [...prevUsers, {
                        userId: data.userId,
                        userName: data.userName,
                        userEmail: data.userEmail,
                        isOnline: true,
                        messages: [newMessage]
                    }];
                } else {
                    // Update existing user
                    return prevUsers.map(u => {
                        if (u.userId === data.userId) {
                            return {
                                ...u,
                                messages: [...(u.messages || []), newMessage]
                            };
                        }
                        return u;
                    });
                }
            });

            // If this is the selected user, add message to chat view
            if (selectedUser && selectedUser.userId === data.userId) {
                setMessages(prev => [...prev, {
                    text: data.message,
                    from: 'user',
                    time: new Date(data.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                }]);
            }
        });

        // User connected notification
        socket.on('user-connected', (data) => {
            console.log('👤 New user connected:', data.userName);
            // Add notification UI if needed
        });

        // User disconnected
        socket.on('user-disconnected', (data) => {
            console.log('👤 User disconnected:', data.userId);
            setUsers(prev => prev.map(u => 
                u.userId === data.userId ? { ...u, isOnline: false } : u
            ));
        });

        // Reply sent confirmation
        socket.on('reply-sent', (data) => {
            console.log('✅ Reply sent to user:', data.userId);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('recruiter-logged-in');
            socket.off('login-failed');
            socket.off('new-user-message');
            socket.off('user-connected');
            socket.off('user-disconnected');
            socket.off('reply-sent');
        };
    }, [selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const selectUser = (user) => {
        setSelectedUser(user);
        
        // Load messages for this user
        const userMessages = user.messages || [];
        const formattedMessages = userMessages.map(msg => ({
            text: msg.message,
            from: msg.from,
            time: new Date(msg.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        }));
        setMessages(formattedMessages);
    };

    const handleSendReply = (e) => {
        e.preventDefault();
        const trimmedReply = replyText.trim();
        if (!trimmedReply || !selectedUser || !isConnected) return;

        setIsSending(true);

        const now = new Date();
        const newMessage = {
            text: trimmedReply,
            from: 'recruiter',
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setReplyText('');

        // Send reply via socket
        socket.emit('recruiter-reply-to-user', {
            userId: selectedUser.userId,
            message: trimmedReply,
            recruiterName: RECRUITER_NAME
        });

        // Update user's message history
        setUsers(prev => prev.map(u => {
            if (u.userId === selectedUser.userId) {
                return {
                    ...u,
                    messages: [...(u.messages || []), {
                        message: trimmedReply,
                        from: 'recruiter',
                        recruiterName: RECRUITER_NAME,
                        timestamp: now.toISOString()
                    }]
                };
            }
            return u;
        }));

        setTimeout(() => {
            setIsSending(false);
        }, 500);
    };

    // Show loading screen if not connected or logged in
    if (!isConnected || !isLoggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {isConnected ? 'Logging in...' : 'Connecting to server...'}
                    </h2>
                    <p className="text-gray-600">{RECRUITER_NAME}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            
            {/* Top Navigation Bar */}
            <div className="bg-blue-800 text-white p-4 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <MessageSquare className="w-8 h-8 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
                            <p className="text-sm text-blue-200">{RECRUITER_NAME} • {RECRUITER_EMAIL}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center bg-blue-700 px-4 py-2 rounded-full">
                            <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                            <span className="text-sm font-medium">{isConnected ? 'Online' : 'Offline'}</span>
                        </div>
                        <Link href="/">
                            <button className="flex items-center bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition">
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Sidebar - User List */}
                <div className="w-80 bg-white border-r flex flex-col shadow-lg">
                    <div className="p-4 border-b bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Users className="w-5 h-5 mr-2 text-blue-600" />
                                <h2 className="text-lg font-bold text-gray-800">User Chats</h2>
                            </div>
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {users.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {users.length === 0 ? (
                            <div className="p-8 text-center">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No users yet</p>
                                <p className="text-sm text-gray-400 mt-2">Users will appear here when they start chatting</p>
                            </div>
                        ) : (
                            users.map(user => (
                                <div
                                    key={user.userId}
                                    onClick={() => selectUser(user)}
                                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                                        selectedUser?.userId === user.userId ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start flex-1">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-lg mr-3 flex-shrink-0">
                                                {user.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-gray-800 truncate">{user.userName}</p>
                                                    <Circle 
                                                        className={`w-2.5 h-2.5 ml-2 flex-shrink-0 ${
                                                            user.isOnline 
                                                                ? 'fill-green-500 text-green-500' 
                                                                : 'fill-gray-400 text-gray-400'
                                                        }`}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{user.userEmail}</p>
                                                <div className="flex items-center mt-2">
                                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                                        {user.messages?.length || 0} messages
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b bg-white flex items-center shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-lg mr-4">
                                    {selectedUser.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-lg">{selectedUser.userName}</h3>
                                    <div className="flex items-center">
                                        <p className="text-sm text-gray-500 mr-3">{selectedUser.userEmail}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            selectedUser.isOnline 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {selectedUser.isOnline ? '● Online' : '○ Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No messages yet</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div key={index} className={`flex ${msg.from === 'recruiter' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-lg p-4 rounded-2xl shadow-md ${
                                                msg.from === 'recruiter'
                                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                                            }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                                <span className={`block mt-2 text-xs ${
                                                    msg.from === 'recruiter' ? 'text-blue-200' : 'text-gray-500'
                                                }`}>
                                                    {msg.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Reply Input */}
                            <form onSubmit={handleSendReply} className="p-4 border-t bg-white">
                                <div className="relative flex items-center">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="w-full resize-none border border-gray-300 rounded-xl py-3 px-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 text-gray-800 disabled:bg-gray-100"
                                        rows="2"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendReply(e);
                                            }
                                        }}
                                        disabled={isSending || !isConnected}
                                    />
                                    <button
                                        type="submit"
                                        className={`absolute right-2 bottom-2 p-3 rounded-full shadow-lg transition duration-200 ${
                                            isSending || !isConnected || replyText.trim() === '' 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105 active:scale-95'
                                        }`}
                                        disabled={isSending || !isConnected || replyText.trim() === ''}
                                    >
                                        <Send className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Press Enter to send • Shift+Enter for new line
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                                <p className="text-xl text-gray-600 font-medium">Select a user to start chatting</p>
                                <p className="text-sm text-gray-400 mt-2">Choose from the list on the left</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}