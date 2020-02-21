import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import { store } from "../../index"
import {socket} from "../Chat/Chat";
import uuidv4 from "uuid/v4";
import './Join.css';

//Данный компонент отвечает за домашнюю страницу, с которой пользователь попадает в случайную комнату

const Join = () =>{
    const [name, setName] = useState('');
    const [room] = useState( () => uuidv4() ); //uuidv4 Использован для получения рандомной комнаты
    const [validation, setValidation] = useState('Name'); //validation отвечает за placeholder инпута, по совместительству обработчик ошибок

    var checkstore = store.getState(); //Сброс имеющейся сессии, в случае возвращения из комнаты на страницу логина. Данный факт определяется наличием имени в store-е.
    if(checkstore.name) {     
        socket.close();
        store.dispatch({type: "NOT_CONNECTED", payload: true});
        store.dispatch({type: "CHANGE_NAME", payload: ""});
        store.dispatch({type: "CHANGE_ROOM", payload: ""}); //Убран getstate
};

    return(
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
            <h1 className="heading">Join</h1>

            <div><input 
            placeholder={validation} 
            value={name} 
            className="joinInput" 
            type="text" maxLength="16" 
            onChange={(event) => setName(event.target.value)}/></div>
            <Link to={`/chat`}>  {/* Перенаправление в чат после валидного инпута. Здесь можно добавить ?room=${room}, чтобы пользователь мог сразу скопировать ссылку, без нажатия на соответсвующую кнопку в чате */}
             
            <button onClick={(event) =>  {
                let validNickname = name.replace(/\s/g, ''); //Проверка инпута на пробелы
                if(validNickname === "") {setValidation("Name cannot be empty"); event.preventDefault(); setName(""); } //В случае если инпут пуст/содержит только пробелы - плейсхолдер сменяется на ошибку
                else { 
                    store.dispatch({type: "CHANGE_NAME", payload: name}) 
                    store.dispatch({type: "CHANGE_ROOM", payload: room}) 
                };
                //Отправка полученного с инпута имени, и заранее полученной рандомной комнаты в store, для дальнейшего их получения на странице чата
            }}className="button mt-20" type="submit">Sign In</button>

            </Link>   
        </div>
</div>
    )
}

export default Join;
