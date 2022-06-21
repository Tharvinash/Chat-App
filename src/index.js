const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

// let count = 0;
io.on("connection", (socket) => {
    console.log("Client Connected");

    socket.emit("message", generateMessage('Welcome'));
    socket.broadcast.emit("message", generateMessage('New User Joined')); // emit to everyone but that connection

    socket.on("sendMessage", (message, callback) => {
        const filter = new Filter();
        if(filter.isProfane(message)) {
            return callback("Not allowed");
        };

        io.emit("message", generateMessage(message));
        callback();
    });

    socket.on("disconnect", () => {
        io.emit("message", generateMessage('User Left'));
    });

    socket.on("sendLocation", (location, callback) => {
        io.emit("locationMessage", generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
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

