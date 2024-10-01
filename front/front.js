const socket = io('http://localhost:3000')
socket.on('connect', () => {
  console.log('connected')
})
var loginModal = new bootstrap.Modal(document.getElementById('login'));

window.addEventListener('load', function() {
    loginModal.show();
});

function submitUsername(){
    const input = document.getElementById('UsenameInput');
    const username = input.value;
    if(username !== ""){
        socket.emit("username", username);
        input.value = '';
        loginModal.hide()
    } 
}

function sendMessage(){
    const chatinput = document.getElementById('ChatInput');
    const message = chatinput.value;
    if(message !== ""){
        socket.emit("chat message", message)
    }
}

socket.on('welcome', (welcomeMessage)=>{
    console.log({welcomeMessage})
    document.getElementById('welcomeMessage').innerHTML = welcomeMessage;
})


//<div class="chat-message sent-message">
//    Hello! How can I help you?
//</div>