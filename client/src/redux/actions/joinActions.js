import { SET_LOGIN_ERROR } from "../types";
import { changeName, changeRoom } from "./userActions";

import io from "socket.io-client";
const ENDPOINT = 'localhost:80/chat';

//Функция для проверки на повторяющийся никнейм в комнате
//В случае удачной проверки устанавливает значения name и room в стейте, оичщает loginError
//В случае ошибки - устаналвиает loginError

// @name: string
// @room : string
export function checkNickname(name, room) {
    let socket = io(ENDPOINT);
    return function(dispatch) {
        socket.emit('checkNickname', {name:name, room:room}, error => {
            if (error) {
                dispatch(setLoginError(error.error));
                socket.disconnect('unauthorized');
            } else {
                dispatch(changeName(name));
                dispatch(changeRoom(room));
                dispatch(resetLoginError());
                socket.disconnect('unauthorized');
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
