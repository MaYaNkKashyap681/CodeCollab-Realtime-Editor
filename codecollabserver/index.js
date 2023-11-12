const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

var idUserMap = {};
var typingMap = {};
var roomChats = {}; // Add roomChats to store chat messages

function getAllClientsInRoom(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                userName: idUserMap[socketId],
                isTyping: typingMap[roomId] && typingMap[roomId][socketId] || false,
            };
        }
    );
}

io.on("connection", (socket) => {
    socket.on('joinroom', ({ roomId, userName }, err) => {
        idUserMap[socket.id] = userName;
        typingMap[roomId] = typingMap[roomId] || {};
        roomChats[roomId] = roomChats[roomId] || []; // Initialize roomChats for the room

        socket.join(roomId);
        const clientsInRoom = getAllClientsInRoom(roomId);

        clientsInRoom.forEach(({ socketId, isTyping }) => {
            io.to(socketId).emit('newuser', {
                clientsInRoom,
                userName,
                socketId: socket.id,
                isTyping,
            });
        });

        socket.on("codechange", ({ roomId, code }) => {
            const clientsInRoom = getAllClientsInRoom(roomId);
            clientsInRoom.forEach(({ socketId }) => {
                io.to(socketId).emit('updatingcode', {
                    code,
                    userName: idUserMap[socket.id],
                });
            });
        });

        socket.on("langchange", ({ roomId, language, code }) => {
            const clientsInRoom = getAllClientsInRoom(roomId);
            clientsInRoom.forEach(({ socketId }) => {
                io.to(socketId).emit('changedlanguage', {
                    language,
                    userName: idUserMap[socket.id],
                    code,
                });
            });
        });

        socket.on("typing", ({ roomId, isTyping }) => {
            typingMap[roomId][socket.id] = isTyping;
            const clientsInRoom = getAllClientsInRoom(roomId);
            clientsInRoom.forEach(({ socketId }) => {
                io.to(socketId).emit('typingstatus', {
                    isTyping,
                    userName: idUserMap[socket.id],
                });
            });
        });

        // Emit the existing chat messages when a user joins
        io.to(socket.id).emit('chats', {
            chatArray: roomChats[roomId],
        });
    });

    socket.on('newchat', ({ roomId, message, userName }) => {
        roomChats[roomId].push({
            message,
            userName,
        });
        getAllClientsInRoom(roomId).forEach(({ socketId }) => {
            io.to(socketId).emit('chats', {
                chatArray: roomChats[roomId],
            });
        });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit("leftroom", {
                socketId: socket.id,
                userName: idUserMap[socket.id],
            });
        });
        delete idUserMap[socket.id];
        socket.leave();
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
