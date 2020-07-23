import {SET_LOGIN_ERROR} from "../types";

//Редюсер отвечающий за аутентификацию
//Ошибка отслеживается на фронтенде, и в случае её наличия - отклоняет аутентификацию

const initialJoinState = {
    loginError: ""
}

export function joinReducer(state = initialJoinState, action) {
    switch (action.type) {
        case SET_LOGIN_ERROR: return {...state, loginError: action.payload}
        default: return state;
    }
}