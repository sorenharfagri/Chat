const express = require ('express');
const socketio = require ('socket.io');
const http = require ('http');
const app = express();
const moment = require('moment');

const {addUser, removeUser, getUser, checkNickname, getUsersInRoom} = require ('./users.js'); //Методы для работы с пользователями
const PORT =  process.env.PORT  || 5000;

const server = http.createServer(app);
const io =  socketio(server);


app.get("/", (req, res ) =>
{
   res.send({ response: "Server is up and running." }).status(200);
})

io.on('connection', (socket) =>{
console.log('New connection');


socket.on('join', ({name, room}, callback) =>{                 //Данный listener используется для подключения в комнату. Принимает имя и комнату пользователя
console.log(`User connected with id ${socket.id}`)
const {error, user} = addUser({ id: socket.id, name, room });  //Проверка полученного никнейма, сравнение с имеющимися в комнате. Так-же проверяется наличие комнаты

//Обработка ошибок
if(error) {  return callback(error); }                            //В случае ошибки подключения к комнате не происходит, callback-ом отправляется статус ошибки

socket.join(user.room);                                                      //В случае успешной валидации пользователь подключается к полученной ранее комнате

socket.emit('message', {user: 'admin', text:`${user.name}, welcome to the room ${user.room} :palm_tree:`}); //При первом подключении отправляется приветствие от лица Админа комнаты
socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} :sunglasses: joined to the chat!`}) //Оповещение о подключении пользователя для нынешних жильцов комнаты

io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) }); //Отправление информации о комнате пользователя. (Его комната, список пользователей данной комнаты)

callback();
});

socket.on('sendMessage', (message, callback) =>{ //Данный сокет ожидает сообщение от клиента

const user = getUser(socket.id);  //Получение отправителя сообщения по его socket.id 

const date = moment().format('LTS'); //Формирование даты отправки 

io.to(user.room).emit('message', {user: user.name, text:message, date:date}); //Отправка сформированного сообщения в комнату


callback();
});

socket.on('checkNickname', ({name, room}, callback) => { //Лисенер для проверки на повторяющийся никнейм в комнате

const error = checkNickname({name, room})

if(error) {return callback(error);}

callback();
});

socket.on('disconnect', () =>{
    console.log(`User with id ${socket.id} has left`);
    const user = removeUser(socket.id);           //Удаление из списка активных пользователей комнаты при дисконнекте


    if(user){ 
        io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left.`}) //Текстовое оповещение пользователей комнаты о ливере
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)}); //Обновление данных на клиенте об активных пользователях
    }
})
});

server.listen(PORT, () => console.log(`Server is working on port ${PORT}`));