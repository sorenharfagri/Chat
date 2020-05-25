import React from 'react';
import { render } from 'react-dom';
import rootReducer from './reducers/rootReducer';
import { Provider } from 'react-redux';
import { createStore } from "redux";
import App from './App';

//Создаём стор redux-а
const store = createStore(rootReducer);

render (
    <Provider store={store}>
        <App />
    </Provider>,
    document.querySelector("#root")
);

export {store};