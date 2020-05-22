const express = require ('express');
const socketio = require ('socket.io');
const http = require ('http');
const app = express();
const moment = require('moment');
const {addUser, removeUser, getUser, checkNickname, getUsersInRoom} = require ('./users.js'); //Методы для работы с пользователями

const PORT =  process.env.PORT || 80;
const server = http.createServer(app);
const io =  socketio(server);

var roomsWithVideoChat = []; //Массив используется для хранения информации о том, в каких комнатах проходят видеотрансляции, чтобы вновь прибывший пользователь получил необходимые данные


app.get("/", (res) => {
   res.send({ response: "Server is up and running." }).status(200);
});



io.on('connection', (socket) =>{
  console.log('New connection');

  var videoChatStatus = false; 
  //Статус используется для эмита на клиентов комнаты, в которой проходит видеотрансляция. 
  //На фронтенде в случае значения true подключается компонент который отвечает за дальнейшую логику видеочата
  //Для стримера на фронтенде используется локальный статус
  

  socket.on('join', ({name, room}, callback) =>{                 //Данный listener используется для подключения в комнату. Принимает имя и комнату пользователя
     console.log(`User connected with id ${socket.id}`);
     
     const {error, user} = addUser({ id: socket.id, name, room }); //Добавление юзера в комнату. Проверка полученного никнейма, сравнение с имеющимися в комнате. Так-же проверяется наличие комнаты
     //Обработка ошибок
     if (error) return callback(error);                            //В случае ошибки подключения к комнате не происходит, callback-ом отправляется статус ошибки

     socket.join(user.room);                                                    //В случае успешной валидации пользователь подключается к полученной ранее комнате

     socket.emit('message', {user: 'admin', text:`${user.name}, welcome to the room ${user.room} :palm_tree:`}); //При первом подключении отправляется приветствие от лица Админа комнаты

     socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} :sunglasses: joined to the chat!`}); //Оповещение о подключении пользователя для нынешних жильцов комнаты

     io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)}); //Отправление информации о комнате пользователя. (Его комната, список пользователей данной комнаты)


     //В случае если в комнате нового пользователя проходит стрим, то на клиента посылается статус который задействует необходимый компонент
     const isRoomWithVideoChat = roomsWithVideoChat.find(roomWithWeb=>roomWithWeb === user.room);

     if (isRoomWithVideoChat)  socket.emit("videoChatData", true);

     callback();
   });

  socket.on('sendMessage', (message, callback) => { //Данный сокет ожидает сообщение от клиента
     const user = getUser(socket.id);  //Получение отправителя сообщения по его socket.id 
     const date = moment().format('LTS'); //Формирование даты отправки 

     io.to(user.room).emit('message', {user: user.name, text:message, date:date}); //Отправка сформированного сообщения в комнату


     callback();
   });

  socket.on('checkNickname', ({name, room}, callback) => { //Лисенер для проверки на повторяющийся никнейм в комнате
     const error = checkNickname({name, room});

     if (error) return callback(error);

     callback();
   });


   //Синхронизация видеочата
   //На данный сокет приходит сообщение от стримера в случае начатия трансляции
   //Сокет в свою очередь отсылает на клиентов статус который активизирует компонент с видеотрансляцией
   //У стримера используется локальный статус на фронтенде

   //Так-же сокет служит для отключения трансляции
  socket.on("videoChatConnect", () => {
     let user = getUser(socket.id);
     videoChatStatus = !videoChatStatus; //Изменение статуса видеочата в рамках сессии

     if (!videoChatStatus) {             //В случае повторного эмита сокета, т.е отключения трансляции, комната исключается из списка комнат с видеочатом
         console.log("Video chat disabled");
         let index = roomsWithVideoChat.findIndex(roomWithWeb => roomWithWeb === user.room); 
         if (index !== -1) roomsWithVideoChat.splice(index, 1)[0];

         socket.broadcast.to(user.room).emit("videoChatData", videoChatStatus); //Оповещение клиентов об окончании трансляции
      } else {                
         console.log("Room added in array");                                                //Инициализация трансляции                 
         roomsWithVideoChat.push(user.room);                                 //Добавление в список комнат с трансляцией   

         socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} starts live broadcast :bird:`}); //Оповещение клиентов в комнате о начале трансляции
         socket.broadcast.to(user.room).emit("videoChatData", videoChatStatus);    //Оповещение клиентов о начале трансляции
      }
   });




  //Сокеты для работы с WebRTC

  //Получение sdp оффера от стримера, переправка клиенту
  socket.on("OfferFromStreamer", (desc, newSocketId) => {
     let user = getUser(socket.id);
    
     console.log(`I ${socket.id} got offer from streamer ${desc} and id of client ${newSocketId}`);
     io.to(user.room).emit(`${newSocketId}:GetOfferFromStreamer`, desc);
   });


  //Когда пир подключается - он эмитит этот соккет
  //Чтобы стример сформировал для него sdp оффер ,и в целом обратил внимание на нового пира
  socket.on("NewPeer", newSocketId => {
     let user = getUser(newSocketId);

     console.log("New Peer emitted");
     if (socket.id === newSocketId) {
         console.log(`New peer connected`);
         io.to(user.room).emit("NewPeerOnStreamer", newSocketId); 
      };
   })




  //Получение ответа от клиента, переправка стримеру
  socket.on("AnswerForStreamer", (desc, newSocketId) => {
     let user = getUser(newSocketId);

     console.log("AnswerForStreamer emitted");

     if (socket.id === newSocketId) io.to(user.room).emit("GotAnswerOnStreamer", desc, newSocketId);
   });



  //Получение кандидата от клиента, переправка стримеру
  socket.on("CandidateForStreamer", (candidate, newSocketId) => {
     console.log("Got candidate for streamer");
    
     let user = getUser(newSocketId);
    
     if (socket.id === newSocketId) io.to(user.room).emit("GetCandidateOnStreamer", candidate, newSocketId );
   });


  //Получение кандидата от стримера, переправка клиенту
  socket.on("CandidateForClient", (candidate, newSocketId) => {
     console.log("Got candidate for client");

     let user = getUser(newSocketId);

     io.to(user.room).emit(`${newSocketId}:GetCandidates`, candidate); //Клиент идентифицируется на клиенте с помощью его socket.id
   });


 
  socket.on('disconnect', () => {
     let user = removeUser(socket.id);           //Удаление из списка активных пользователей комнаты при дисконнекте

     if (user) { 
         console.log(`User with id ${socket.id} has left`);
         
         if (videoChatStatus) {       //В случае если пользователь ливнул будучи стримером 
            videoChatStatus = false;
            const index = roomsWithVideoChat.findIndex(roomWithWeb => roomWithWeb === user.room);

            if (index !== -1) roomsWithVideoChat.splice(index, 1)[0];  //Комната удаляется из списка комнат со стримами

            io.to(user.room).emit("videoChatData", videoChatStatus); //Клиенты в комнате оповещаются об окончании стрима
         }

         io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left.`}); //Текстовое оповещение пользователей комнаты о ливере
         io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)}); //Обновление данных на клиенте об активных пользователях
      };
   });
});

server.listen(PORT, () => console.log(`Server is working on port ${PORT}`));