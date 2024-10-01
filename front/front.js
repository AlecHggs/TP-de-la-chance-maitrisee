const socket = io('http://localhost:3000')
socket.on('connect', () => {
  console.log('connected')
})
var loginModal = new bootstrap.Modal(document.getElementById('login'));

window.addEventListener('load', function() {
    loginModal.show();
});

var user = '';

function submitUsername(){
    const input = document.getElementById('UsenameInput');
    const username = input.value;
    if(username !== ""){
        socket.emit("username", username);
        user = username;
        input.value = '';
        loginModal.hide()
    } 
}

function sendMessage(){
    const chatinput = document.getElementById('ChatInput');
    const message = chatinput.value;
    if(message !== ""){
        socket.emit("chat message", message);
        addMessage(user, message);
        chatinput.value = '';
    }
}

socket.on('chat message', (username, message)=>{
    addMessage(username, message)
})

function addMessage(username, message){
    const mess = document.createElement('div');
    mess.innerHTML = username +': '+ message;
    document.getElementById('chatBox').appendChild(mess);
}

socket.on('welcome', (welcomeMessage)=>{
    document.getElementById('welcomeMessage').innerHTML = welcomeMessage;
    chatWindow.classList.remove('invisible');
})

socket.on('game full', (fullMessage)=>{
    document.getElementById('welcomeMessage').innerHTML = fullMessage;
    homeButton.classList.remove('invisible');
})
