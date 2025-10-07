import { Server } from 'socket.io';

// Fixed ID for the Recruiter/Agent to ensure messages are styled correctly
const AGENT_ID = 'recruiter-jane';

const SocketHandler = (req, res) => {
    // Check if the Socket.io server is already running
    if (res.socket.server.io) {
        console.log('Socket.io server already running.');
        res.end();
        return;
    }

    // 1. Initialize the Socket.io Server
    const io = new Server(res.socket.server, {
        path: '/api/socket', // IMPORTANT: Match this path with the client's connection path
        addTrailingSlash: false,
    });

    // 2. Define Connection Logic
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        
        // Simple 2-person chat: just broadcast all messages
        socket.on('sendMessage', (msg) => {
            console.log(`[Message from ${msg.senderId}]: ${msg.text}`);

            // Broadcast the message to all clients *except* the sender.
            // This is perfect for a simple practice project where two clients chat.
            socket.broadcast.emit('receiveMessage', msg); 
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    // 3. Attach the IO instance to the server response object
    res.socket.server.io = io;
    res.end();
};

export default SocketHandler;
