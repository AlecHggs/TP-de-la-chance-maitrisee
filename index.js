import { Server } from 'socket.io'
import express from 'express'
import http from 'http'

const app = express()
const server = http.createServer(app)
const io = new Server(server, 
  {
    cors: {
      origin: '*',
    }
  }
)

let users = []
let socketUser = {}
let roomId = "UniqueId"

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)

  socket.on('username', (username) => {
    if(users.length >= 300){
      const welcomeMessage = `Bonjour ${username}, nous sommes ${users.length}. Nous ne pouvons pas vous ajouter à la partie`;
      socket.emit('game full', welcomeMessage);
    }else{
      socket.join(roomId);
      console.log('Username received:', username);
      users.push(username)
      socketUser[socket.id] = username
      const welcomeMessage = `Bienvenue ${username}, nous sommes ${users.length}`;
      socket.emit('welcome', welcomeMessage);
      const joinGameMessage = `${socketUser[socket.id]} a rejoint.`;
      socket.to(roomId).emit('toast', 'success', joinGameMessage);
      if(users.length > 2){
        io.to(roomId).emit('game start');
      }
    }
  });

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg); 
    socket.to(roomId).emit('chat message', socketUser[socket.id], msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id)
    const isInRoom = socket.rooms.has(roomId);
    if (isInRoom) {
      const leftGameMessage = `${socketUser[socket.id]} a quitté.`;
      socket.to(roomId).emit('toast', 'danger', leftGameMessage);
      delete socketUser[socket.id];
    }
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})