const socket = io('http://localhost:3000')
socket.on('connect', () => {
  console.log('connected')
})

function submitUsername(){
    const input = document.getElementById('UsenameInput');
    const login = document.getElementById('login');

    const username = input.value;
    if(username !== ""){
        socket.emit("username", username);
        input.value = '';
        login.classList.add("invisible")
    } 
}

socket.on('welcome', (welcomeMessage)=>{
    console.log({welcomeMessage})
    document.getElementById('welcomeMessage').innerHTML = welcomeMessage;

})