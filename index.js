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

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)

  socket.on('username', (username) => {
    console.log('Username received:', username);
    users.push(username)
    const welcomeMessage = `Bienvenue ${username}, nous sommes ${users.length}`;
    socket.emit('welcome', welcomeMessage);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id)
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})