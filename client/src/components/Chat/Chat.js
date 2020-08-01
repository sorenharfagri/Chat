import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import queryString from 'query-string';
import {useHistory} from 'react-router-dom'
import {disconnectFromRoom} from "../../redux/actions/chatActions";
import './Chat.css';

import Messages from "./Messages/Messages";
import InfoBar from './infobar/infoBar';
import Input from './Input/input.js';
import UsersList from './UsersList/UsersList';
import ChatJoinForm from "./ChatJoinForm/ChatJoinForm";

import VideoChatStreamer from "./VideoChat/VideoChatStreamer";
import VideoChatClient from "./VideoChat/VideoChatClient";

//Главный компонент
//Отвечает непосредственно за чат
//Имеет логику, которая позволяет определить - есть ли у пользователя имя/комната
//Если таковых нет - будет предложен логин/редирект на хоумпейдж

//Получение комнаты с query строки
const queryStr = queryString.parse(window.location.search)

const Chat = () => {

    const history = useHistory();
    const dispatch = useDispatch();

    //Получение данных о комнате и имени со стора Redux, в случае если пользователь перешёл в чат с Join-а
    const name = useSelector(state => state.user.name);
    const reduxStoreRoom = useSelector(state => state.user.room);

    //Получение комнаты пользователя
    //Если таковой не найдено - происходит редирект на хоумпейдж
    const [room] = useState(reduxStoreRoom || queryStr.room || redirect());

    //Статус видеотрансляции
    //Используется для отображения окна видеотрансляции зрителям
    //А так-же для сокрытия кнопки включения, когда стрим уже начат.
    //True означает что трансляция проходит в данный момент.
    const isStream = useSelector(state => state.chat.stream);

    //Локальный статус видеотрансляции.
    //Используется для логики на стороне стримера, отвечает за нейминг кнопки включения, и инициализацию видеотрансляиции.
    //True означает что трансляция проходит в данный момент, и клиент - стример.

    //Если isStream = true = Задействуется компонент видеочата для зрителя
    //Если isStreamer = true - Задействуется компонент видеочата для стримера
    const [isStreamer, setIsStreamer] = useState(false);

    function redirect() {
        history.push("/");
    }

    //Эмитация componentWillUnmount
    //При покидании страницы чата - данные пользователя будут стёрты, произойдёт дисконнет от комнаты на сервере
    useEffect(() => {

        return () => {
            dispatch(disconnectFromRoom());
        }

    }, [])

    //Если пользователь не имеет никнейма, ему будет предложен компонент с формой логина
    if (!name) {
        return (
            <ChatJoinForm
                name={name}
                room={room}
            />
        )
    }


    //InfoBar - Панель сверху
    //VideoChatClient - Логика видеотрансляции на клиенте
    //VideoChatStreamer - Видеотраналсяция на стримере
    //Messages - Коллекция сообщений, отвечает за их отрисовку
    //Input - Инпут сообщения, отвечает за отправку нового сообщения
    //UsersList - Список пользователей комнаты
    return (
        <div className="outerContainer">
            <div className="myContainer">
                <InfoBar
                    room={room}
                    isStream={isStream}
                    setIsStreamer={setIsStreamer}
                    isStreamer={isStreamer}
                />
                {isStream ? <VideoChatClient/> : isStreamer ?
                    <VideoChatStreamer isStreamer={isStreamer} setIsStreamer={setIsStreamer}/> : null}
                <Messages name={name}/>
                <Input/>
            </div>
            <UsersList/>
        </div>
    );
};


export default Chat;




