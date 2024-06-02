const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const turkce = require("turkce");
const { Console } = require('console');
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const players = []
let seeRivalArray = []
let rivalArrayCheck = false

let userInputs = []
let userInputsCheck = false

const lobbies = {
  sbt4: [],
  sbt5: [],
  sbt6: [],
  sbt7: [],
  dyn4: [],
  dyn5: [],
  dyn6: [],
  dyn7: []
};

const getOpponentKeyword = (userEmail) => {
  const opponent = players.find(item => item.fromEmail !== userEmail);
  return opponent ? opponent.entriedInput : null;
}
const playerResults = {};
const userSockets = new Map(); 
io.on('connection', async (socket) => {
//  // then
// turkce("sajjsa").then(console.log).catch(console.error);

// // async / await
// (async () => {
//   try {
//     const sonuc = await turkce("sajjsa");
//     console.log(sonuc);
//   } catch (e) {
//     console.error(e);
//   }
// })();
  console.log('Yeni bir bağlantı oldu:', socket.id);
  socket.on('registerEmail', (email) => {
    userSockets.set(email, socket.id);
    const socketId = userSockets.get(email);
  });
  socket.on('getLobiler', () => {
    // Tüm lobi isimlerini ve o lobideki kullanıcıları gönder
    io.emit('lobiListesi' , Object.keys(lobbies).map(key => ({ adi: key, users: lobbies[key] })));
    io.emit('lobiListesi2', Object.keys(lobbies).map(key => ({ adi: key, users: lobbies[key] })));
  });

  socket.on('aktifLobiGuncelle', ({lobiAdi,userEmail}) => {
    const socketId = userSockets.get(userEmail);
    if(socketId) {
    io.to(socketId).emit('aktifLobi', lobiAdi);
    }
  });

  socket.on('keyword', ({ keyword, toEmail, fromEmail}) => {
    const toSocketId = userSockets.get(toEmail);
    const fromSocketId = userSockets.get(fromEmail);
    if(toSocketId && fromSocketId) {
      console.log(keyword);
      io.to(toSocketId).emit('getFindKeyword', {keyword: keyword});
      
    }
  });

  socket.on('sendScore', ({score, fromEmail, toEmail, findKeyword,time}) => {
    playerResults[fromEmail] = {
      score: score,
      finished: true,
      findKeyword: findKeyword,
      time: time
    };
    const fromSocketId = userSockets.get(fromEmail);
    io.to(fromSocketId).emit('StatusAlert',{status : true});

    console.log(fromEmail+" game finished..........................");
    const fromUser = players.find(item => item.fromEmail === fromEmail);
    console.log(fromUser+" game finished..........................");
    // Tüm oyuncular bitirdi mi diye kontrol et
   checkAllPlayersFinished({user : fromUser});
  });

  const checkAllPlayersFinished = ({user}) => {

    const allPlayers = Object.keys(playerResults);
    const allFinished = allPlayers.every(playerId => playerResults[playerId].finished);
    // console.log(playerResults[user.fromEmail].finished + " finished");
    console.log(allPlayers + " finished");
    const user1 = playerResults[user.fromEmail]?.finished || null;
    const user2 = playerResults[user.toEmail]?.finished || null;
    console.log(user1 + " finished");
    console.log(user2 + " finished");
    console.log(allPlayers + "QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ");
    const fromSocketId = userSockets.get(user.fromEmail);
    // io.to(fromSocketId).emit('StatusAlert',{status : true});

    if (user1 && user2) { // 2 oyuncunun da bitirdiğinden emin ol
      const toSocketId = userSockets.get(user.toEmail);
        io.to(toSocketId).emit('goToResults', {
          results: playerResults,
          fromEmail: user.toEmail,
          toEmail: user.fromEmail
        });
      
        io.to(fromSocketId).emit('goToResults', {
          results: playerResults,
          fromEmail: user.fromEmail,
          toEmail: user.toEmail
        });
      // Sonraki oyun için durumu temizle
      playerResults[user.toEmail] = {};
      playerResults[user.fromEmail] = {};
    }
    else{
      console.log("alertttttt" + user.fromEmail);
      const fromSocketId = userSockets.get(user.fromEmail);
      io.to(fromSocketId).emit('getWaitingAlert', {message: "Rakibin oyunu bitirmesi bekleniyor?"});
    }
  }; 

  socket.on('oyunuBitir', ({ winner, loser,findKeyword,time,score}) => {
    const winnerSocketId = userSockets.get(winner);
    const loserSocketId = userSockets.get(loser);
    console.log(winner, loser, findKeyword, time, score);
    if(winnerSocketId && loserSocketId) {
      io.to(winnerSocketId).emit('StatusAlert',{status : true});
      io.to(winnerSocketId)
        .emit('WinnerAlert', {winner: winner, loser: loser,score: score, time: time,message: "Rakibinizin kelimesini doğru bildiğiniz için siz kazandınız."});
      
      io.to(loserSocketId).emit('StatusAlert',{status : true});
      io.to(loserSocketId)
        .emit('LoserAlert', {winner: winner, loser: loser,score: score, time: time,message: "Rakibiniz sizden önce kelimeyi bildiği için kaybettiniz."});
    }
  });

  // socket.on('sendScore', ({ score, fromEmail,toEmail}) => {
  //   const fromEmailSocketId = userSockets.get(fromEmail);
  //   const toEmailSocketId = userSockets.get(toEmail);
  //   if(fromEmailSocketId && toEmailSocketId) {

  // const fromUser = players.find(item => item.fromEmail === fromEmail);

  //     io.to(fromEmailSocketId).emit('StatusAlert',{status : true});
  //     io.to(fromEmailSocketId)
  //       .emit('WinnerAlert', {message: "Rakibinizin kelimesini doğru bildiğiniz için siz kazandınız."});
      
  //     io.to(toEmailSocketId).emit('StatusAlert',{status : true});
  //     io.to(toEmailSocketId)
  //       .emit('LoserAlert', {message: "Rakibiniz sizden önce kelimeyi bildiği için kaybettiniz."});
  //   }
  // });
  
  // Burada input giren kullanıcılar bir lsiteye eklenecek. 
  // Eğer players dizisi 2 kişi olduysa oyun ekranına gerekli bilgilerle yönlendirme yapılmalı.
  socket.on('AddNewInput', ({keyword, toEmail, fromEmail}) => {
    const toSocketId = userSockets.get(toEmail);
    const fromSocketId = userSockets.get(fromEmail);
    console.log('input: ' + keyword);
    console.log('toEmail: ' + toEmail);
    console.log('fromEmail: ' + fromEmail);
    players.push({fromEmail: fromEmail, toEmail: toEmail ,entriedInput: keyword});
    console.log(players.length);
    if(players.length % 2 == 0){
      console.log(players.length);
      players.forEach(item => {
        io.to(userSockets.get(item.fromEmail))
        .emit('GoGamePage', {entriedInput: item.entriedInput, 
                              opponentInput: getOpponentKeyword(item.fromEmail),
                              fromEmail: item.fromEmail,
                              toEmail: item.toEmail});
          // console.log(item.entriedInput + ' ' + getOpponentKeyword(item.fromEmail) + ' ' + item.fromEmail + ' ' + item.toEmail);
      });
//burada pLAYERS Da azaltma yapılacak

    }

  });

  socket.on('GetOpponentArrays', ({currentEmail, opponentEmail}) => {
    console.log('ulaaaa yirmağaa gideyruuum: ' + opponentEmail)
    io.to(userSockets.get(opponentEmail)).emit('GetGameDatas', {currentEmail: currentEmail, opponentEmail: opponentEmail});
    // rivalArrayCheck = seeRivalArray.some(item => item.currentEmail == opponentEmail)
    // if(!rivalArrayCheck){
    //   // Burada bizim dizimizde rakibin email'i yok demektir. Ve bir event tetiklenip o kullanıcının ekranındaki verilerin
    //   // alınması gerekir. Sonra dönen bu veriler diziye push atılmalıdır.
    //   io.to(userSockets.get(opponentEmail)).emit('GetGameDatas', {currentEmail: currentEmail, opponentEmail: opponentEmail})
    // }
    // else{
    //   // Eğer bizim listemizde varsa event tetiklenerek değerler alınıp daha sonra bizim dizideki değerler güncellenmelidir.
    // }
  });

  socket.on('ReturnedDatas', ({inputsArray, colorsArray, currentEmail, opponentEmail }) => {
    rivalArrayCheck = seeRivalArray.some(item => item.currentEmail == opponentEmail)
    if(!rivalArrayCheck){
      // Burada bizim dizimizde rakibin email'i yok demektir. Bize dönen arrayler seeRivalArray dizisine push edilmeli.
      seeRivalArray.push({currentEmail: opponentEmail, opponentEmail: currentEmail,inputsArray: inputsArray, colorsArray: colorsArray})
      // Bu dataları currentEmail'in RivalScreen'ine data olarak gönderip ekrana basmak gerekiyor.
      console.log('Server tarafında veri kontrolü: ')
      console.log(inputsArray)
      console.log(colorsArray)
      io.to(userSockets.get(currentEmail)).emit('SetRivalScreenDatas',{inputsArray: inputsArray, colorsArray: colorsArray})
      

    }
    else{
       // Eğer bizim listemizde varsa event tetiklenerek değerler alınıp daha sonra bizim dizideki değerler güncellenmelidir.
       seeRivalArray.find(item => item.currentEmail == opponentEmail).inputsArray = inputsArray
       seeRivalArray.find(item => item.currentEmail == opponentEmail).colorsArray = colorsArray
    }
  });

  socket.on('UpdateArrays', ({userEmail, inputArray, colorArray}) => {
    userInputsCheck = userInputs.includes(userEmail)
    console.log("İlk veriler server tarafına alınıp yazılırkenki veriler:")
    console.log(inputArray)
    console.log(colorArray)
    console.log(userInputsCheck)
    if(!userInputsCheck){
      console.log("ifin içerisine girdi ve pushlama işlemini düzgün bir şekilde yaptı.")
      console.log(inputArray)
      console.log(colorArray)
      userInputs.push({userEmail: userEmail, inputArray: Array.from(inputArray), colorArray: Array.from(colorArray)})
      console.log('push attıktan sonraki deneme')
      console.log(userInputs.find(x => x.userEmail == userEmail).inputArray[0])
      console.log(userInputs.find(x => x.userEmail == userEmail).colorArray[0])
    }else{

    }
  })

  socket.on('GetRivalDatas', ({requestByEmail, email}) => {
    console.log('GetRivalDatas kısmına geldi. Serverdaki datalar kontrol ediliyor.')
    console.log(userInputs)
    console.log(userInputs)
    let data = {
      inputArray: userInputs.find(x => x.userEmail == email)?.inputArray || null,
      colorArray: userInputs.find(x => x.userEmail == email)?.colorArray || null
    }

    io.to(userSockets.get(requestByEmail))
      .emit('RivalServerResponse', {data: data})
  })

  socket.on('CheckPlayers', ({fromEmail}) => {
    if(players.length == 1){
      console.log(players[0].fromEmail)
      io.to(userSockets.get(players[0].fromEmail))
        .emit('WinnerAlert', {message: "Rakibiniz kelime girişi yapmadığı için siz kazandınız."});
      
      io.to(userSockets.get(players[0].toEmail))
        .emit('LoserAlert', {message: "Kelime girişi yapmadığınız için kaybettiniz."});
      }
      else if(players.length == 0){
        console.log("CheckPlayers'ın içerisindeki else if kısmıııııı..");
        console.log(userSockets.get(fromEmail));
        io.to(userSockets.get(fromEmail))
          .emit('NoInputAlert', {message: 'Belirtilen süre içerisinde kelime girişi yapmadınız. Lütfen giriş yapınız..'});
      }
  });



  socket.on('sendGameRequestByEmail', ({ toEmail, fromEmail }) => {
    const toSocketId = userSockets.get(toEmail);
    if(toSocketId) {
    console.log(`${fromEmail} requested ${toEmail}`);
      io.to(toSocketId).emit('gameRequestReceived', { fromEmail });
    }
  });
 socket.on('sendGameRequest', ({ toUserId, fromUserId }) => {
    // toUserId, isteğin gönderildiği kullanıcının soket id'sidir.
    // fromUserId, isteği gönderen kullanıcının soket id'sidir.
    console.log(`${fromUserId} requested ${toUserId}`);
    io.to(toUserId).emit('gameRequestReceived', { fromUserId });
  });

 socket.on('respondToGameRequest', ({ response, fromEmail,toEmail }) => {
    // response, isteğin kabul edilip edilmediğini belirten bir string ('accepted' veya 'declined')
    const fromSocketId = userSockets.get(fromEmail);
    console.log(`${fromEmail} requested------------111111111111111111111 ${toEmail}`);
    if (fromSocketId) {
      // İsteği gönderen kullanıcıya yanıtı iletmek için soket ID'sini kullanın
      io.to(fromSocketId).emit('gameRequestResponse', { response,toEmail });
    }
  });

  socket.on('joinLobi', ({ lobiName, userName }) => {
    if(lobbies[lobiName] && !lobbies[lobiName].includes(userName)) {
      socket.join(lobiName);
      lobbies[lobiName].push(userName);
      // O lobiye katılan herkese yeni kullanıcı listesini gönder
      
      io.to(lobiName).emit('lobiUpdate',{adi : lobiName, users: lobbies[lobiName]});
      io.to(lobiName).emit('lobiUpdate2',{adi : lobiName, users: lobbies[lobiName]});
      socket.emit('currentUsers', lobbies[lobiName]);
      socket.emit('currentUsers2', lobbies[lobiName]);
      console.log(`${userName} joined ${lobiName}`);
    }
    console.log('güncellenen lobi -- '+lobbies[lobiName]);
  });

  socket.on('leaveLobi', ({ lobiName, userName }) => {
    if(lobbies[lobiName]) {
      socket.leave(lobiName);
      lobbies[lobiName] = lobbies[lobiName].filter(user => user !== userName);
      // O lobideki herkese güncellenmiş kullanıcı listesini gönder
      io.to(lobiName).emit('lobiUpdate', {adi : lobiName, users: lobbies[lobiName]});
      io.to(lobiName).emit('lobiUpdate2', {adi : lobiName, users: lobbies[lobiName]});
      console.log(`${userName} left ${lobiName}`);
      players.pop();
      players.pop();
    }
  });

  // Kullanıcının bağlantısı kesildiğinde tüm lobilerden çıkar
  socket.on('disconnect', () => {
    Object.keys(lobbies).forEach(lobiName => {
      if(lobbies[lobiName].includes(socket.id)) {
        lobbies[lobiName] = lobbies[lobiName].filter(user => user !== socket.id);
        io.to(lobiName).emit('lobiUpdate', lobbies[lobiName]);
        io.to(lobiName).emit('lobiUpdate2', lobbies[lobiName]);
      }
    });
    console.log(`Bağlantı kesildi: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('Sunucu 3000 portunda çalışıyor.');
});
