import {RESET_USER_DATA, SET_NAME, SET_ROOM} from "../types";

// @name: string
// @room: string
const initialUserState = {
    name: "",
    room: ""
}

//Редюсер овтечающий за взаимодействие с данными пользователя
export function userReducer(state = initialUserState, action) {
    switch (action.type) {
        case SET_NAME: return {...state, name: action.payload};
        case SET_ROOM: return {...state, room: action.payload};
        case RESET_USER_DATA: return {...state, name: "", room: ""}
        default: return state;
    }
}