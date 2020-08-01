import { SET_LOGIN_ERROR } from "../types";
import { changeName, changeRoom } from "./userActions";
import { socket } from './sockets.js'


//Функция для подключения к комнате
//В случае удачной проверки устанавливает значения name и room в стейте, очищает loginError
//В случае ошибки - устанавливает loginError

// @name: string
// @room : string
export function joinRoom(name, room) {
    return function(dispatch) {
        socket.emit('join', {name, room}, error => {
            if (error) {
                dispatch(setLoginError(error));
            } else {
                dispatch(changeName(name));
                dispatch(changeRoom(room));
                dispatch(resetLoginError());
            }
        });
    }
}

export function setLoginError(error) {
    return {
        type: SET_LOGIN_ERROR,
        payload: error
    }
}

export function resetLoginError() {
    return {
        type: SET_LOGIN_ERROR,
        payload: ""
    }
}
