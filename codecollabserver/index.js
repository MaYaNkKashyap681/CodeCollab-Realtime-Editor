const express = require('express') //importing the express
const app = express(); //Creating the app
const http = require('http'); // importing http from http module 
const { Server } = require('socket.io'); //getting server from socket.io


// Creating http Server
const server = http.createServer(app);
// Making an io server so that the socket can be used
const io = new Server(server)

var idUserMap = {}

function getAllClientsInRoom(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                userName: idUserMap[socketId],
            };
        }
    );
}

// Getting the Connection
io.on("connection", (socket) => {
    socket.on('joinroom', ({ roomId, userName }, err) => {
        //adding user to the map'
        // console.log(userName)
        idUserMap[socket.id] = userName;

        //making user join the room
        socket.join(roomId);

        //getting all clients in the room
        const clientsInRoom = getAllClientsInRoom(roomId)

        //emmiting the newuser join to every user
        clientsInRoom.forEach(({ socketId }) => {
            io.to(socketId).emit('newuser', {
                clientsInRoom,
                userName,
                socketId: socket.id
            })
        })

        socket.on("codechange", ({ roomId, code }) => {
            const clientsInRoom = getAllClientsInRoom(roomId)
            clientsInRoom.forEach(({ socketId }) => {
                io.to(socketId).emit('updatingcode', {
                    code,
                    userName: idUserMap[socket.id]
                })
            })
        })

        socket.on("langchange", ({ roomId, language, code }) => {
            // console.log(code);
            const clientsInRoom = getAllClientsInRoom(roomId)
            clientsInRoom.forEach(({ socketId }) => {
                io.to(socketId).emit('changedlanguage', {
                    language,
                    userName: idUserMap[socket.id],
                    code
                })
            })
        })
    })

    //disconnecting from the room
    socket.on('disconnecting', () => {
        //to get all the rooms 
        // console.log(socket.rooms)
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

//Starting the Server
const PORT = 3000
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
