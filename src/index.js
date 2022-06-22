const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

// let count = 0;
io.on("connection", (socket) => {
    console.log("Client Connected");

    // socket.emit("message", generateMessage('Welcome'));
    // socket.broadcast.emit("message", generateMessage('New User Joined')); // emit to everyone but that connection

    socket.on("join", (options, callback) => {

        const {error, user} = addUser({id: socket.id, ...options });

        if (error) {
            return callback(error)
        }

        socket.join(user.room);

        socket.emit("message", generateMessage('Admin', 'Welcome'));
        socket.broadcast.to(user.room).emit("message", generateMessage('Admin', `${user.username} has joined`)); // emit to everyone but that connection

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })
    
    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter();
        if(filter.isProfane(message)) {
            return callback("Not allowed");
        };

        io.to(user.room).emit("message", generateMessage(user.username, message))
        callback();
    });

    socket.on("sendLocation", (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    });

    socket.on("disconnect", () => {

        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    
    });

    // socket.emit("countUpdated", count);

    // socket.on("inc", () => {
    //     count++;
    //     // socket.emit("countUpdated", count); only emit to specific connection
    //     io.emit("countUpdated", count);
    // });
})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})

