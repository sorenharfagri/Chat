import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import io from "socket.io-client";
import queryString from 'query-string';
import {useHistory} from 'react-router-dom'

import Messages from "./Messages/Messages";
import InfoBar from './infobar/infoBar';
import Input from './Input/input.js';
import UsersList from './UsersList/UsersList';
import ChatJoinForm from "./ChatJoinForm/ChatJoinForm";

import VideoChatStreamer from "./VideoChat/VideoChatStreamer";
import VideoChatClient from "./VideoChat/VideoChatClient";

import './Chat.css';

//Главный компонент
//Отвечает непосредственно за чат и его логику

//Резерв для сокета
let socket;
const ENDPOINT = "localhost:80/chat"


const Chat = ({location}) => {

    //Получение данных о комнате и имени со стора Redux, в случае если пользователь перешёл в чат с Join-а
    const reduxStoreName = useSelector(state => state.name);
    const reduxStoreRoom = useSelector(state => state.room);

    const [queryStr] = useState(queryString.parse(location.search)) //Получение комнаты с query строки
    const [name, setName] = useState(reduxStoreName); //Получение имени со stor-а, в случае если пользователь перешёл в чат с Join-а
    const [message, setMessage] = useState(''); //Сообщение
    const [messages, setMessages] = useState([]); //Коллекция сообщений
    const [users, setUsers] = useState('');       //Коллекция пользователей комнаты
    let history = useHistory();
    const dispatch = useDispatch();

    //Глобальный статус видеотрансляции.
    //Используется для отображения окна видеотрансляции, и для сокрытия кнопки включения, когда стрим уже начат.
    //True означает что трансляция проходит в данный момент.
    const [globalVideoChatStatus, setGlobalVideoChatStatus] = useState(false);

    //Локальный статус видеотрансляции.
    //Используется для логики на стороне стримера, отвечает за нейминг кнопки включения, и инициализацию видеотрансляиции.
    //True означает что трансляция проходит в данный момент, и клиент - стример.
    const [localVideoChatStatus, setLocalVideoChatStatus] = useState(false);

    //Получение комнаты пользователя
    //Если таковой не найдено - происходит редирект на хоумпейдж
    const [room] = useState(reduxStoreRoom || queryStr.room || redirect());

    //Получение статуса логина, с помощью функции выше
    const [loginStatus, setLoginStatus] = useState(getLoginStatus());

    //Функция для получения информации о том, какие данные имеются у пользователя. (Есть ли имя/комната)
    //Исходя из данных пользователю будет предложена форма логина
    function getLoginStatus() {
        if (room && name) return "HasNameAndRoom";
        else return "NoNameHasRoom";
    }

    function redirect() {
        history.push("/");
    }


    //Обработка подключения
    useEffect(() => {

        if (!socket) {
            socket = io(ENDPOINT);
        } //Если пользователь не подключен - происходит подключение к сокету, так-же стейт оповещается о том, что дальнейшие подключения не требуются.

        if (loginStatus === "HasNameAndRoom") {      //Если пользователь подключился с хоумпейджа, происходит подключение к комнате.
            setLoginStatus("Connected");          //Изменения стейта во избежании повторного подключения

            socket.emit('join', {name, room}, (error) => {         //Подключение к комнате
                //В случае ошибки связанной с никнеймом, пользователю будет повторно предложена форма логина в текущую комнату
                if (error) setLoginStatus("NoNameHasRoom");
            });
        }
    }, [room, name, loginStatus]);


    //Обработка сообщений и списка пользователей, работа с сокетами
    useEffect(() => {
        if (!socket) return undefined;  //Если пользователь не подключен к сокету - получения информации о комнате не происходит.

        socket.on('message', (message) => {     //Получение обработанного сообщения с сервера, добавление в список сообщений, дальнейший его рендер
            setMessages([...messages, message]);
        });

        socket.on('initialData', (_messages) => {
            setMessages([...messages, ..._messages]);
        })

        socket.on('roomData', ({users}) => {  //Получение данных о пользователях комнаты
            setUsers(users);
        });


        socket.on("videoChatData", (videoChatStatus) => {  //Получение статуса видеотрансляции
            setGlobalVideoChatStatus(videoChatStatus);
        });


        return () => {
            socket.off("message")
            socket.off('roomData')
            socket.off('videoChatData')
            socket.off('initialData')
        }

    }, [messages, loginStatus, globalVideoChatStatus])

    //Эмитация componentWillUnmount
    useEffect(() => {

        return () => {
            console.log("Connection closed")
            dispatch({type: "SET_NAME", payload: ""});
            dispatch({type: "SET_ROOM", payload: ""});

            socket.emit('disconnect');
            socket.disconnect('unauthorized');
            socket = null;
        }

    }, [])


    //Если пользователь не имеет никнейма, ему будет предложен компонент с формой логина
    if (loginStatus === "NoNameHasRoom") {
        return (
            <ChatJoinForm
                socket={socket}
                name={name}
                setName={setName}
                room={room}
                setLoginStatus={setLoginStatus}
            />
        )
    }

    //Первичная отправка сообщений на сервер. На сервере сообщение обрабатывается (Сообщение получает отправителя, и дату отправки), затем эмитится всей комнате.
    const sendMessage = (event) => {
        event.preventDefault();
        //Отправка сообщения, и очистка текущего сообщения, для очистики input-а
        if (message) socket.emit('sendMessage', message, () => setMessage(''));
    };


    //InfoBar - Панель сверху, на ней располагаются кнопки
    //VideoChatClient - Логика видеотрансляции на клиенте
    //VideoChatStreamer - Видеотраналсяция на стримере
    //Messages - Коллекция сообщений
    //Input - Инпут сообщения
    //UsersList - Список пользователей комнаты
    return (
        <div className="outerContainer">
            <div className="myContainer">
                <InfoBar
                    socket={socket}
                    room={room}
                    globalVideoChatStatus={globalVideoChatStatus}
                    setLocalVideoChatStatus={setLocalVideoChatStatus}
                    localVideoChatStatus={localVideoChatStatus}
                />

                {globalVideoChatStatus ? <VideoChatClient socket={socket}/> : localVideoChatStatus ?
                    <VideoChatStreamer
                        socket={socket}
                        localVideoChatStatus={localVideoChatStatus}
                        setLocalVideoChatStatus={setLocalVideoChatStatus}
                    /> : null
                }

                <Messages messages={messages}
                          name={name}/> {/* Модуль отрисовки сообщений, применяется после получения обработанного сообщения с сервера*/}
                <Input message={message} setMessage={setMessage}
                       sendMessage={sendMessage}/> {/* Инпут сообщений, формирует и отправляет сообщение на сервер*/}
            </div>
            <UsersList users={users}/> {/* Список пользователей */}
        </div>
    );
};


export default Chat;




