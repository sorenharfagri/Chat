import {RESET_USER_DATA, SET_NAME, SET_ROOM} from "./types";

//Начальное состояние store
//Room - комната чата
const initialState = {
    name: "",
    room: ""
}


function rootReducer(state= initialState, action)
{

    switch (action.type) {
        case SET_NAME: return {...state, name: action.payload};
        case SET_ROOM: return {...state, room: action.payload};
        case RESET_USER_DATA: return {...state, name: "", room: ""}
        default: return state;
    }
}

export default rootReducer;