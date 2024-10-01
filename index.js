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

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)



  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id)
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})