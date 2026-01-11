const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const logger = require('./utils/logger');

let io;
const connectedUsers = new Map(); // userId -> { socketId, userData }

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*', // Allow all origins for simplicity in dev, restrict in prod
            methods: ['GET', 'POST']
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('username roles');

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const user = socket.user;
        logger.info(`User connected via socket: ${user.username}`);

        // Add to connected users
        connectedUsers.set(user._id.toString(), {
            socketId: socket.id,
            user: {
                _id: user._id,
                username: user.username,
                roles: user.roles,
                lastActiveAt: new Date()
            }
        });

        // Broadcast updated online count/list
        broadcastOnlineUsers();

        // Allow client to request current state
        socket.on('getOnlineUsers', () => {
            const users = Array.from(connectedUsers.values()).map(u => u.user);
            socket.emit('onlineUsersUpdate', {
                count: users.length,
                users: users
            });
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${user.username}`);
            connectedUsers.delete(user._id.toString());
            broadcastOnlineUsers();
        });
    });
};

const broadcastOnlineUsers = () => {
    if (!io) return;

    const users = Array.from(connectedUsers.values()).map(u => u.user);
    io.emit('onlineUsersUpdate', {
        count: users.length,
        users: users
    });
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIo
};
