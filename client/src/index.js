import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from "redux";
import App from './App';


//Работа с Redux

//Начальное состояние store
const initialState = {
    name: "",                //Имя пользователя
    room: "",                //Комната
    notConnected : true,     //Установлено ли соединение с пользователем
    test: "BAD"
}


function name(state=initialState, action)
{
    switch(action.type) {
        case "CHANGE_NAME": return Object.assign({}, state, {name:action.payload} );  //Метод для получения имени в store
        case "CHANGE_ROOM": return Object.assign({}, state, {room:action.payload} );  //Метод для получения логина в store
        case "NOT_CONNECTED": return Object.assign({}, state, {notConnected:action.payload} ); //Метод предназначенный для избежания повторных соединений в chat.js
        default: return state;
    }
}

const store = createStore(name);






ReactDOM.render(<App />, document.querySelector('#root'));

export {store};