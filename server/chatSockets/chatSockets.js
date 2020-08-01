//Модуль для работы с сокетами чата

//Методы для работы с пользователями
const {addUser, removeUser, checkNickname, getUsersInRoom} = require('./users.js');

const moment = require('moment');

let roomsWithVideoChat = [];
let roomsMessages = {};

const chatSockets = (io) => {

    let chat = io.of('/chat')

    chat.on('connection', socket => {
        console.log('New connection');
        let user;

        //Статус используется для эмита на пользователей комнаты, в которой проходит видеотрансляция.
        //На фронтенде в случае значения true подключается компонент который отвечает за дальнейшую логику видеочата
        //Для стримера на фронтенде используется локальный статус
        //Пот подключении в комнату принимает значение false
        let isStreamer;

        //Данный listener используется для подключения в комнату
        socket.on('join', ({name, room}, callback) => {

            //Добавление Пользователя в комнату. Проверка полученного никнейма, сравнение с имеющимися в комнате
            //Так-же проверяется наличие комнаты
            const {error, user: newUser} = addUser({id: socket.id, name, room});

            //В случае ошибки подключение к комнате не происходит, callback-ом отправляется статус ошибки
            if (error) {
                return callback(error)
            }

            user = newUser;
            isStreamer = false;
            //В случае успешной валидации пользователь подключается к полученной ранее комнате
            socket.join(user.room);

            //В случае если это первый пользователь в комнате - создатёся массив для хранения сообщений комнаты
            if (!roomsMessages[user.room]) roomsMessages[user.room] = [];
            //Если в комнате есть сообщения - они отправляется пользователю
            if (roomsMessages[user.room][0]) {
                socket.emit('initialData', roomsMessages[user.room])
            }

            //При первом подключении отправляется приветствие
            socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room} :palm_tree:` });

            //Оповещение о подключении пользователя для нынешних жильцов комнаты
            socket.broadcast.to(user.room).emit('message', {
                user: 'admin',
                text: `${user.name} :sunglasses: joined to the chat!`
            });

            //Обновление списка пользователей комнаты
            chat.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});

            //В случае если в комнате нового пользователя проходит стрим, то на клиента посылается статус который задействует необходимый компонент
            if (roomsWithVideoChat.find(roomWithWeb => roomWithWeb === user.room)) {
                socket.emit("videoChatData", true);
            }

            callback();
        });

        //Ожидаем сообщение от клиента
        socket.on('sendMessage', message => {
            const date = moment().format('LTS'); //Формирование даты отправки

            //Формируем сообщение
            let msg = {user: user.name, text: message, date: date}
            //Добавляем сообщение в историю
            roomsMessages[user.room].push(msg);
            //Отправляем сообщение в комнату
            chat.to(user.room).emit('message', msg);
        });


        //Синхронизация видеочата
        //На данный сокет приходит сообщение от стримера в случае начатия трансляции
        //Сокет в свою очередь отсылает пользователям комнат статус, который активизирует компонент с видеотрансляцией
        //У стримера используется локальный статус на фронтенде

        //Так-же сокет служит для отключения трансляции, для этого сокет эмитится во второй раз
        socket.on("videoChatConnect", () => {
            isStreamer = !isStreamer; //Изменение статуса видеочата в рамках сессии

            if (isStreamer) {
                //Инициализация трансляции
                //Добавление в список комнат с трансляцией
                roomsWithVideoChat.push(user.room);

                //Оповещение клиентов в комнате о начале трансляции
                //Отправляется статус, который задействует компонент с видеотрансляцией на клиентах
                socket.broadcast.to(user.room).emit('message', {
                    user: 'admin',
                    text: `${user.name} starts live broadcast :bird:`
                });
                socket.broadcast.to(user.room).emit("videoChatData", isStreamer);

            } else {
                //В случае повторного эмита сокета, т.е отключения трансляции, комната исключается из списка комнат с видеочатом
                let index = roomsWithVideoChat.findIndex(roomWithWeb => roomWithWeb === user.room);
                if (index !== -1) {
                    roomsWithVideoChat.splice(index, 1)[0];
                }
                //Оповещение клиентов об окончании трансляции
                socket.broadcast.to(user.room).emit("videoChatData", isStreamer);
            }
        });


        //Сокеты для работы с WebRTC

        //Получение sdp оффера от стримера, переправка зрителю
        socket.on("OfferFromStreamer", (desc, clientSocketID) => {
            chat.to(clientSocketID).emit(`GetOfferFromStreamer`, desc);
        });


        //Когда зритель подключается - он эмитит этот сокет
        //Чтобы стример сформировал для него sdp оффер
        socket.on("NewPeer", clientSocketID => {
            chat.to(user.room).emit("NewPeerOnStreamer", clientSocketID);
        })


        //Получение ответа от зрителя, переправка стримеру
        socket.on("AnswerForStreamer", (desc, clientSocketID) => {
            chat.to(user.room).emit("GotAnswerOnStreamer", desc, clientSocketID);
        });


        //Получение кандидата от клиента, переправка стримеру
        socket.on("CandidateForStreamer", (candidate, clientSocketID) => {
            chat.to(user.room).emit("GetCandidateOnStreamer", candidate, clientSocketID);
        });


        //Получение кандидата от стримера, переправка клиенту
        socket.on("CandidateForClient", (candidate, clientSocketID) => {
            chat.to(clientSocketID).emit(`GetCandidates`, candidate);
        });

        //Функция для отключения пользователя из комнаты
        //Удаляет пользователя из списка пользователей комнаты
        //Очищает массив сообщений, если комната отныне пуста
        //В случае если пользователь был стримером - удаляет комнату из списка комнат со стримом,
        //И оповещает пользователей об окончании трансляции
        function disconnect() {
            let user = removeUser(socket.id);           //Удаление из списка активных пользователей комнаты при дисконнекте

            if (user) {
                console.log(`User with id ${socket.id} has left`);

                //Если комнаты не существует - пользователь был в ней последним
                //Удаляем массив сообщений комнаты
                if (!io.nsps['/chat'].adapter.rooms[user.room]) delete roomsMessages[user.room]

                //В случае если пользователь ливнул будучи стримером
                if (isStreamer) {
                    const index = roomsWithVideoChat.findIndex(roomWithWeb => roomWithWeb === user.room);

                    //Комната удаляется из списка комнат со стримами
                    if (index !== -1) roomsWithVideoChat.splice(index, 1)[0];

                    //Клиенты в комнате оповещаются об окончании стрима
                    chat.to(user.room).emit("videoChatData", false);
                }

                chat.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left.`}); //Текстовое оповещение пользователей комнаты о ливере
                chat.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)}); //Обновление данных на клиенте об активных пользователях
            };
        }

        //Принудительный дисконнект из комнаты
        socket.on('disconnectFromRoom', callback => {
            disconnect();
            callback("Success");
        });


        socket.on('disconnect', () => {
            disconnect();
        });

    });


}

module.exports = chatSockets;