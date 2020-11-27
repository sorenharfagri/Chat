import {combineReducers} from "redux";
import {userReducer} from "./reducers/userReducer";
import {loginReducer} from "./reducers/loginReducer";
import {chatReducer} from "./reducers/chatReducer";

export const rootReducer = combineReducers({
    user: userReducer,
    login: loginReducer,
    chat: chatReducer
});
