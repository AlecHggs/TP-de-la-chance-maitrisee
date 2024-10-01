const socket = io('http://localhost:3000')
socket.on('connect', () => {
  console.log('connected')
})

function submitUsername(){
    const username = document.getElementById('UsenameInput').value;
    socket.emit("username", username);
}