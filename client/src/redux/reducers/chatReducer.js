import {ADD_MESSAGES, ADD_MESSAGE, SET_USERS, SET_STREAM_STATUS, RESET_ROOM_DATA} from "../types";

//Касательно 'stream'
//true означает что в данный момент пользователь находится в комнате в которой проходит трансляция
//Задействуется соответствующий компонент

const initialChatState = {
    messages: [],
    users: "",
    stream: false
}

export function chatReducer(state = initialChatState, action) {

    switch (action.type) {
        case ADD_MESSAGE: return {...state, messages: [...state.messages, action.payload]}
        case ADD_MESSAGES: return {...state, messages: [...state.messages, ...action.payload]}
        case SET_USERS: return {...state, users: action.payload}
        case SET_STREAM_STATUS: return {...state, stream: action.payload}
        case RESET_ROOM_DATA: return {...state , messages: [], users: "", stream:false}
        default: return state;
    }

}