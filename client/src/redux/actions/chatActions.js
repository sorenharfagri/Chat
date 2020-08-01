import {ADD_MESSAGES, ADD_MESSAGE, SET_USERS, SET_STREAM_STATUS, RESET_ROOM_DATA, RESET_USER_DATA} from "../types";
import {socket} from "./sockets.js"

//Action-ы связанные непосредственно с логикой чата

//Добавление одного сообщения
export function addMessage(messages) {
    return {
        type: ADD_MESSAGE,
        payload: messages
    }
}

//Добавление сообщений, сообщения передаются в виде массива
export function addMessages(messages) {
    return {
        type: ADD_MESSAGES,
        payload: messages
    }
}

export function setUsers(users) {
    return {
        type: SET_USERS,
        payload: users
    }
}

export function setStreamStatus(status) {
    return {
        type: SET_STREAM_STATUS,
        payload: status
    }
}

//Дисконнект из комнаты
//Удаляются данные пользователя и комнаты
export function disconnectFromRoom() {
    return function(dispatch) {
        socket.emit('disconnectFromRoom', success => {
            if (success) {
                dispatch({type:RESET_USER_DATA})
                dispatch({type:RESET_ROOM_DATA})
            } else {
                console.error("Error in disconnectFromRoom")
            }
        })
    }
}


//Запуск логики стрима на сервере
export function startStream() {
    socket.emit('videoChatConnect')
}