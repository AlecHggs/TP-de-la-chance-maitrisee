// Initiate connection
const socket = io('http://localhost:3000')
socket.on('connect', () => {
  console.log('connected')
})

var loginModal = new bootstrap.Modal(document.getElementById('login'));

window.addEventListener('load', function() {
    loginModal.show(); 
});

var user = '';
var user_points = 100;

// Fonctions

function submitUsername(){
    const input = document.getElementById('UsernameInput');
    const username = input.value;
    if(username !== ""){
        socket.emit("username", username);
        user = username;
        input.value = '';
        loginModal.hide();
    } else {
        loginError.classList.remove('d-none')
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

function addMessage(username, message){
    const name = document.createElement('div');
    const mess = document.createElement('div');
    if(username === user){
        mess.classList.add('my-message');
        name.classList.add('my-name');
    }else{
        mess.classList.add('incoming-message')
        name.classList.add('sender-name');
    }
    name.innerHTML = username;

    mess.innerHTML = message;
    document.getElementById('chatBox').appendChild(name);
    document.getElementById('chatBox').appendChild(mess);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function startTimer(timeLeft, message) {
    const timerElement = document.getElementById('timerDisplay');
    var timeLeft = Math.floor(timeLeft / 1000)
    const interval = setInterval(
        function() {
            if (timeLeft < 10) {
                timeLeft = '0' + timeLeft;
            }

            timerElement.innerHTML = `${message} ${timeLeft} secondes`;

            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(interval);
                timerElement.innerHTML = "Partie finie!";
            }
    }, 1000)
};

function addToast(status, message){
    const toastContainer = document.getElementById('toastContainer');
    const delay = 5000; 

    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.classList.add(`text-bg-${status}`);
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.setAttribute('data-bs-delay', delay);

    toast.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
    `;

    toastContainer.appendChild(toast);

    const bootstrapToast = new bootstrap.Toast(toast);

    bootstrapToast.show();

    toast.addEventListener('hidden.bs.toast', ()=>{
        toast.remove();
    });
}

function onBetType(betType) {
    if(betType === "heads"){
        const elementClassList = document.getElementById('heads').classList;
        const oppositeElementClassList = document.getElementById('tails').classList
        elementClassList.add('active');

        if (oppositeElementClassList.contains('active')){
            oppositeElementClassList.remove('active')
        }
    }else {
        const elementClassList = document.getElementById('tails').classList;
        const oppositeElementClassList = document.getElementById('heads').classList
        elementClassList.add('active');
        if (oppositeElementClassList.contains('active')){
            oppositeElementClassList.remove('active')
        }
    }
}

function onBetSubmit(betValue){
    if(document.getElementById('tails').classList.contains('active')){
        return socket.emit('parier', 'pile', betValue);
    }
    return socket.emit('parier', 'face', betValue);
}

function addRoundStatusMessage(message, status){
    const mess = document.createElement('div');

    mess.innerHTML = message;
    mess.classList.add('align-self-center');
    mess.classList.add('fst-italic');
    if(status === 'danger'){
        mess.classList.add('text-danger');
    }else if(status === 'success'){
        mess.classList.add('text-success')
    }
    document.getElementById('chatBox').appendChild(mess);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addResultsToModal(result){
    let result_container = document.getElementById('resultContainer');
    const ul = document.createElement('ul');

    for (let key in result) {
        if (result.hasOwnProperty(key)) {
            const li = document.createElement('li');
            li.textContent = `${key}: ${result[key]}`;
            ul.appendChild(li);
        }
    }
    result_container.appendChild(ul);
}

function changeButtonStates(){
    const betButtonArray = Array.from(document.getElementsByClassName('betButton'));

    betButtonArray.forEach((button)=>{
        if (button.innerHTML > user_points){
            button.setAttribute("disabled", true)
        } else (
            button.removeAttribute("disabled")
        );
    })
}

// Socket actions

socket.on('chat message', (username, message)=>{
    addMessage(username, message)
})

socket.on('welcome', (welcomeMessage)=>{
    document.getElementById('welcomeMessage').innerHTML = welcomeMessage;
    chatWindow.classList.remove('invisible');
    cardWindow.classList.remove('invisible');
    navBar.classList.remove('invisible');
})

socket.on('game full', (fullMessage)=>{
    document.getElementById('welcomeMessage').innerHTML = fullMessage;
    homeButton.classList.remove('invisible');
})

socket.on('toast', (status, message)=>{
    addToast(status, message);
})

socket.on('round status', (timeLeft, message)=>{
    startTimer(timeLeft, message);
})

socket.on('solde', (value)=>{
    user_points = value;

    changeButtonStates();

    userPointDisplay.innerHTML = `Vos points restants: ${user_points}`;
})

socket.on('game start', ()=>{
    document.getElementById('gameWindow').classList.remove('d-none');
})

socket.on('user counter', (message)=>{
    userCountMessage.innerHTML = message;
})

socket.on('result', (message)=>{
    addRoundStatusMessage(message, 'primary');
    socket.emit('solde');
})

socket.on('result message', (status, message)=>{
    addRoundStatusMessage(message, status);
})

socket.on('round counter', (roundNum)=>{
    RoundCounter.innerHTML = `Round ${roundNum}`;
})

socket.on('final result', (result)=>{
    console.log(result);
    addResultsToModal(result);
    var resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
    resultModal.show();
})

// event listeners

document.getElementById('ChatInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});