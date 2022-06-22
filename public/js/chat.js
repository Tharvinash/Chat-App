const socket = io();

// socket.on("countUpdated", (count) => {
//     console.log("count updated ", count);
// })

// document.querySelector("#increment").addEventListener("click", () => {
//     console.log("clicked");
//     socket.emit("inc");
// })

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})


socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
})

    
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus();
        if(error) {
            return console.log(error);
        }

        console.log("Delivered")
    });
})

$sendLocation.addEventListener('click', (e) => {
    $sendLocation.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        return alert("Geolocation x supported");
    };

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            $sendLocation.removeAttribute('disabled')
            console.log("Location shared !!")
        });
    });
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
});

