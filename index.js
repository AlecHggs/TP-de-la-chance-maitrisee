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
var solde = {}
let gameStarted = false
let round = 0
let betList = []
let roundStartDelay = 10000
let roundEndDelay = 5000
console.log("ready")

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)
  socket.on('username', (username) => {
    if(users.length >= 3){
      const welcomeMessage = `Bonjour ${username}, nous sommes ${users.length}. Nous ne pouvons pas vous ajouter à la partie`;
      socket.emit('game full', welcomeMessage);
    }else{
      socket.join(roomId);
      console.log('Username received:', username);
      users.push(username)
      socketUser[socket.id] = username
      const welcomeMessage = `Bienvenue ${username}`;
      socket.emit('welcome', welcomeMessage);
      const counterMessage = `nous sommes ${users.length}`;
      io.to(roomId).emit('user counter', counterMessage);
      const joinGameMessage = `${socketUser[socket.id]} a rejoint.`;
      socket.to(roomId).emit('toast', 'success', joinGameMessage);
      solde[socketUser[socket.id]] = 100;
      socket.emit('solde', solde[socketUser[socket.id]]);
      if(users.length > 2){
        io.to(roomId).emit('game start');
        playGame(round);
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
    if(gameStarted){
      if(solde[socketUser[socket.id]]){
        if (solde[socketUser[socket.id]] >= somme){
          solde[socketUser[socket.id]] -= somme
          socket.emit('solde', solde[socketUser[socket.id]]);
          const betGameMessage = `${socketUser[socket.id]} a parié ${somme} sur ${pileOuFace}.`;
          io.to(roomId).emit('toast', 'primary', betGameMessage);
          betList.push({"user":socket.id, "round" : round, "side" : pileOuFace, "amount": somme});
        } else{
          const betGameMessage = `${socketUser[socket.id]} vous n'avez pas assez pour parier ${somme} sur ${pileOuFace}.`;
          socket.emit('toast', 'danger', betGameMessage);
          socket.emit('solde', solde[socketUser[socket.id]]);
        }
      }else{
        solde[socketUser[socket.id]] = 100;
        solde[socketUser[socket.id]] -= somme
        socket.emit('solde', solde[socketUser[socket.id]]);
        const betGameMessage = `${socketUser[socket.id]} a parié ${somme} sur ${pileOuFace}.`;
        betList.push({"user":socket.id, "round" : round, "side" : pileOuFace, "amount": somme});
        io.to(roomId).emit('toast', 'primary', betGameMessage);
      }
    }else{
      const betGameMessage = `${socketUser[socket.id]} Les paris ne sont pas ouverts.`;
      socket.emit('toast', 'danger', betGameMessage);
    }
  })

  function playGame(round) {
    if (round <= 2) {
      round++
      io.to(roomId).emit('round counter', round);
      console.log("round start");
      io.to(roomId).emit('round status', roundStartDelay, "Temps restant ");
      gameStarted = true
      setTimeout(() => {
        console.log("End");
        if (round == 3){
          io.to(roomId).emit('round status', roundEndDelay, "Fin de partie dans ");
        }else{
          io.to(roomId).emit('round status', roundEndDelay, "Prochain round dans ");
        }
        gameStarted = false
        computeResults()
        if (round == 3){
          const sortedEntries = Object.entries(dict).sort(([, valueA], [, valueB]) => valueA - valueB);
          const sortedDict = Object.fromEntries(sortedEntries);
          io.to(roomId).emit('final result', sortedDict);
          solde = {}
          round = 0
          betList = []
        }
        setTimeout(() => {
          playGame(round);
        }, roundEndDelay);
      }, roundStartDelay);
    }
  }

  function computeResults(){
    var result = Math.random() < 0.5 ? 'pile' : 'face';
    const resultMessage = `Le résultat est ${result}`;
    io.to(roomId).emit('result', resultMessage);
    const soldeBefore = structuredClone(solde);
    for(var bet in betList){
      if(betList[bet]["side"]==result){
        solde[socketUser[betList[bet]["user"]]] += betList[bet]["amount"] * 2
      }
      soldeBefore[socketUser[betList[bet]["user"]]] += betList[bet]["amount"]
    }

    for (const key in solde) {
      var diff = solde[key] - soldeBefore[key];
      if(diff > 0 && key){
        var msg = `${key} a gagné ${diff} Kishta ce round`
        io.to(roomId).emit('result message', 'success', msg);
      }else if(diff < 0 && key){
        var msg = `${key} a perdu ${diff*-1} Kishta ce round`
        io.to(roomId).emit('result message', 'danger', msg);
      }else {
        var msg = `La balance de ${key} n'a pas bougé ce round`
        io.to(roomId).emit('result message', 'primary', msg);
      }
      solde[key] += 10;
    }
    betList = []
  }

  socket.on('disconnect', () => {
    if(socketUser[socket.id]){
      console.log('user disconnected', socket.id)
      const leftGameMessage = `${socketUser[socket.id]} a quitté.`;
      io.to(roomId).emit('toast', 'danger', leftGameMessage);
      delete socketUser[socket.id];
      users.pop(socketUser[socket.id])
      const counterMessage = `nous sommes ${users.length}`;
      io.to(roomId).emit('user counter', counterMessage);
    }
  })
})

server.listen(3000, () => {
  console.log('listening on *:3000')
})