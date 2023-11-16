const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { CodeModel } = require('./codemodel');
const cors = require('cors');


const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

mongoose.connect('mongodb+srv://mayankkashyap705487:root@cluster0.huczc4n.mongodb.net/?retryWrites=true&w=majority/socketChat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Database Connected');
}).catch((err) => {
    console.log('There is some error', err);
});

var idUserMap = {};
var typingMap = {};
var roomChats = {};

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


function getIdFromName(roomId, userName) {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (!room) {
        return null; // Room doesn't exist
    }

    const socketId = Array.from(room).find((socketId) => {
        return idUserMap[socketId] === userName;
    });

    return socketId || null; // Return null if user not found
}

io.on('connection', (socket) => {
    socket.on('joinroom', async ({ roomId, userName }, err) => {
        idUserMap[socket.id] = userName;
        typingMap[roomId] = typingMap[roomId] || {};
        roomChats[roomId] = roomChats[roomId] || [];

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

        io.to(socket.id).emit('chats', {
            chatArray: roomChats[roomId],
        });
    });


    socket.on('getcode', async ({ roomId, userName }) => {
        const userId = getIdFromName(roomId, userName);

        // console.log(roomId, userName)
        try {
            const existingCode = await CodeModel.findOne({ roomId });

            // console.log(existingCode)
            if (existingCode) {
                console.log("Existing")
                io.to(userId).emit('syncronizer', {
                    code: existingCode.code,
                });
            }
        } catch (error) {
            console.error('Error fetching code from MongoDB:', error);
        }
    })

    socket.on('codechange', async ({ roomId, code }) => {
        const clientsInRoom = getAllClientsInRoom(roomId);
        clientsInRoom.forEach(({ socketId }) => {
            io.to(socketId).emit('updatingcode', {
                code,
                userName: idUserMap[socket.id],
            });
        });

        // Save the new code to MongoDB
        try {
            await CodeModel.findOneAndUpdate(
                { roomId },
                { roomId, code },
                { upsert: true }
            );
        } catch (error) {
            console.error('Error saving code to MongoDB:', error);
        }
    });

    socket.on('langchange', ({ roomId, language, code }) => {
        const clientsInRoom = getAllClientsInRoom(roomId);
        clientsInRoom.forEach(({ socketId }) => {
            io.to(socketId).emit('changedlanguage', {
                language,
                userName: idUserMap[socket.id],
                code,
            });
        });
    });

    socket.on('typing', ({ roomId, isTyping }) => {
        typingMap[roomId][socket.id] = isTyping;
        const clientsInRoom = getAllClientsInRoom(roomId);
        clientsInRoom.forEach(({ socketId }) => {
            io.to(socketId).emit('typingstatus', {
                isTyping,
                userName: idUserMap[socket.id],
            });
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
            socket.in(roomId).emit('leftroom', {
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
