import {combineReducers} from "redux";
import {userReducer} from "./reducers/userReducer";
import {joinReducer} from "./reducers/joinReducer";

export const rootReducer = combineReducers({
    user: userReducer,
    login: joinReducer
});