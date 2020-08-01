import React from 'react';
import { render } from 'react-dom';
import { rootReducer } from './redux/rootReducer';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import {applyMiddleware, createStore, compose} from "redux";
import App from './App';


//Создаём стор redux-а
export const store = createStore(
    rootReducer,
    compose (
        applyMiddleware(thunk),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )
)

render (
    <Provider store={store}>
        <App />
    </Provider>,
    document.querySelector("#root")
);