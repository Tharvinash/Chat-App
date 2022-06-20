const socket = io();

// socket.on("countUpdated", (count) => {
//     console.log("count updated ", count);
// })

// document.querySelector("#increment").addEventListener("click", () => {
//     console.log("clicked");
//     socket.emit("inc");
// })

socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message)
})