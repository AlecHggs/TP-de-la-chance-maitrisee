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
let solde = {}
let gameStarted = false
let round = 0
let betList = []

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
      const welcomeMessage = `Bienvenue ${username}`;
      socket.emit('welcome', welcomeMessage);
      const counterMessage = `nous sommes ${username.length}`;
      io.to(roomId).emit('user counter', counterMessage);
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

  socket.on('solde', () =>{
    if(solde[socketUser[socket.id]]){
      socket.emit('solde', solde[socketUser[socket.id]]);
    }else{
      solde[socketUser[socket.id]] = 100;
      socket.emit('solde', solde[socketUser[socket.id]]);
    }
  })

  socket.on('parier', (pileOuFace, somme) =>{
    if(solde[socketUser[socket.id]]){
      if (solde[socketUser[socket.id]] >= somme){
        solde[socketUser[socket.id]] -= somme
        socket.emit('solde', solde[socketUser[socket.id]]);
        const betGameMessage = `${socketUser[socket.id]} a parié ${somme} sur ${pileOuFace}.`;
        socket.to(roomId).emit('toast', 'primary', betGameMessage);
        betList.push({"user":socket.id, "round" : round, "side" : pileOuFace, "amount": somme})
      } else{
        const betGameMessage = `${socketUser[socket.id]} vous n'avez pas assez pour parier ${somme} sur ${pileOuFace}.`;
        socket.emit('toast', 'primary', betGameMessage);
        socket.emit('solde', solde[socketUser[socket.id]]);
      }
    }else{
      solde[socketUser[socket.id]] = 100;
      solde[socketUser[socket.id]] -= somme
      socket.emit('solde', solde[socketUser[socket.id]]);
      const betGameMessage = `${socketUser[socket.id]} a parié ${somme} sur ${pileOuFace}.`;
      betList.push({"user":socket.id, "round" : round, "side" : pileOuFace, "amount": somme})
      socket.to(roomId).emit('toast', 'primary', betGameMessage);
    }
  })

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id)
    const leftGameMessage = `${socketUser[socket.id]} a quitté.`;
    socket.to(roomId).emit('toast', 'danger', leftGameMessage);
    delete socketUser[socket.id];
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})