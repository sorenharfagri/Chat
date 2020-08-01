import {combineReducers} from "redux";
import {userReducer} from "./reducers/userReducer";
import {loginReducer} from "./reducers/loginReducer";
import {chatReducer} from "./reducers/chatReducer";

//TODO Сокет создаёт 1 соединение на 1 неймспейс, проверить теорию

// socket.on('roomData', ({users}) => {
//     console.log(`Got users in root reducer ${users}`)
// });

export const rootReducer = combineReducers({
    user: userReducer,
    login: loginReducer,
    chat: chatReducer
});