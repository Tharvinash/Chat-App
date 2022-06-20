const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

// let count = 0;
io.on("connection", (socket) => {
    console.log("Client Connected");

    socket.emit("message", "welcome !!");
    socket.broadcast.emit("message", "new user joined"); // emit to everyone but that connection

    socket.on("sendMessage", (message) => {
        io.emit("message", message)
    })

    socket.on("disconnect", () => {
        io.emit("message", "user left")
    })

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

