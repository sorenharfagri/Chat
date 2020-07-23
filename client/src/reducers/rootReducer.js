//Работа с Redux

//Начальное состояние store
const initialState = {
    name: "",                //Имя пользователя
    room: ""              //Комната
}


function rootReducer(state= initialState, action)
{
    switch (action.type) {
        case "SET_NAME": return Object.assign( {}, state, {name:action.payload} );  //Метод для получения имени в store
        case "SET_ROOM": return Object.assign( {}, state, {room:action.payload} );  //Метод для получения логина в store
        default: return state;
    }
}

export default rootReducer;