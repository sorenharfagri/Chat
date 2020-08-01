import io from "socket.io-client";
import {addMessage, addMessages, setStreamStatus, setUsers} from "./chatActions";
import {store} from "../../index";

const ENDPOINT = 'localhost:80/chat';
export let socket = io(ENDPOINT, {reconnection: true})

//Инициализация лисенеров чата
//Происходит при попытке подключения к чату


//Получение списка пользователей
socket.on('roomData', ({users}) => {
    store.dispatch(setUsers(users));
});

//Получение нового сообщения
socket.on('message', message => {
    store.dispatch(addMessage(message));
});

//Получение истории сообщений, происходит 1 раз, при коннекте в комнату
socket.on('initialData', messages => {
    store.dispatch(addMessages(messages));
})

//Получеие статуса трансляции
//Когда стример начинает трансляцию - пользователи получает статус который задействует компонент с видеотрансляцией
socket.on("videoChatData", streamStatus => {
    store.dispatch(setStreamStatus(streamStatus));
});

//Функция для отправки сообщения
export function emitMessage(message) {
    socket.emit('sendMessage', message);
}
