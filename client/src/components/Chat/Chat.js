import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom'
import { store } from "../../index";
import io from "socket.io-client";
import queryString from 'query-string';

import Messages from "../Messages/Messages";
import InfoBar from '../infobar/infoBar';
import Input from '../Input/input.js';
import UsersList from '../UsersList/UsersList';
import ChatJoinForm from "../ChatJoinForm/ChatJoinForm";

import WebChatStreamer from "../WebChat/WebChatStreamer";
import WebChatClient from "../WebChat/WebChatClient";

import './Chat.css';

//Главный компонент
//Отвечает непосредственно за чат и его логику

let socket; //Резерв для сокета


const Chat = ({location}) => {      //location - объект роутера содержащий в себе информацию о текущем url

  const [ENDPOINT] = useState( "localhost:80", {reconnect:true} ); //Endpoint сокета

  const [reduxStore] = useState(store.getState()); //Получение хранилища

  const [query] = useState(queryString.parse(location.search)) //Получение комнаты с query строки
  const [name, setName] = useState(reduxStore.name); //Получение имени со stor-а (Если оно было получено с хоумпейджа)
  const [message, setMessage] = useState(''); //Сообщение 
  const [messages, setMessages] = useState([]); //Коллекция сообщений
  const [users, setUsers] = useState('');       //Коллекция пользователей комнаты

  const [globalVideoChatStatus, setglobalVideoChatStatus] = useState(false); //Глобальный статус видеотрансляции. Используется для отображения окна видеотрансляции, и для сокрытия самой кнопки, когда стрим уже начат. True означает что трансляция проходи в данный момент.
  const [localVideoChatStatus, setLocalVideoChatStatus] = useState(false); //Локальный статус видеотрансляции. Используется для логики на стороне стримера, отвечает за её нейминг кнопки включения, и инициализацию видеотрансляиции. True означает что трансляция проходит в данный момент, и клиент - стример.

  const [connectionStatus, setConnectionStatus] = useState (false); //Стейт отвечающий за соединение с сокетом

  function getRoom () {       //Функция для получения комнаты пользователя
    let room = reduxStore.room //Получение комнаты со stor-а
  
    if(room) return room
    else if(query.room) return query.room //В случае неудачи - получение комнаты с query строки
    else return "";  //В случае отсутствия у пользователя комнаты - возвращается пустое значение, которое в дальнейшем будет обработано.
  }

  const [room] = useState(getRoom); //Получение комнаты пользователя c с помощью функции выше
  
    
  function getLoginStatus () {                //Функция для получения информации о том, какие данные имеются у пользователя. (Есть ли имя/комната) Исходя из них будет предложена форма логина/редирект на хоумпейдж
    if (room && name) return  "HasNameAndRoom";
    else if(room && !name) return "NoNameHasRoom";
    else if(!room && !name) return  "NoNameNoRoom";
  }

  const [loginStatus, setLoginStatus] = useState (getLoginStatus()); //Получение статуса логина, с помощью функции выше

        
  //Обработка подключения
  useEffect(() => { 

    if (loginStatus === "NoNameNoRoom") return undefined; //В случае если комнаты и имени не получено - подключение к сокету не происходит, в дальнейшем произойдёт редирект на хоумпейдж

    if (!connectionStatus) {
      socket = io(ENDPOINT);
      setConnectionStatus(true)
    } //Если пользователь не подключен - происходит подключение к сокету, так-же стейт оповещается о том, что дальнейшие подключения не требуются.

    if (loginStatus === "HasNameAndRoom") {      //Если пользователь подключился с хоумпейджа, происходит подключение к комнате.
      setLoginStatus("ConnectedFromLogin");          //Изменения стейта во избежании повторного подключения

      socket.emit('join', { name, room }, (error) => {         //Подключение к комнате
        if(error) setLoginStatus("NoNameHasRoom");      //В случае ошибки связанной с никнеймом, пользователю будет повторно предложена форма логина в текущую комнату
      });
    }
 }, [ENDPOINT, room, name, loginStatus, connectionStatus]);


    
  //Обработка сообщений и списка пользователей, работа с сокетами
  useEffect(() => {
    if(!connectionStatus) return undefined;  //Если пользователь не подключен к сокету - получения информации о комнате не происходит.

    socket.on('message', (message) => {     //Получение обработанного сообщения с сервера, добавление в список сообщений, дальнейший его рендер
      setMessages([...messages, message ]);
    });
    
    socket.on('roomData', ({users}) => {  //Получение данных о пользователях комнаты
      setUsers(users);
    });


    socket.on("videoChatData", (videoChatStatus) => {  //Получение статуса видеотрансляции
      setglobalVideoChatStatus(videoChatStatus);
    });


    return () => {                     //Обработка отключения
      socket.emit('disconnect');
      socket.off();
    }
      
  }, [messages, connectionStatus, loginStatus, globalVideoChatStatus])



 if (loginStatus === "NoNameNoRoom") return <Redirect to='/' />//Редирект на хоумпейдж, если у пользователя нет комнаты и имени.

 if(loginStatus === "NoNameHasRoom") {  //Если пользователь не имеет никнейма, ему будет предложен компонент с формой логина
    return ( <ChatJoinForm  socket={socket} name={name} setName={setName} room={room} setLoginStatus={setLoginStatus}/>)
  }

 //Первичная отправка сообщений на сервер. На сервере сообщение обрабатывается (Сообщение получает отправителя, и дату отправки), затем эмитится всей комнате.
 const sendMessage = (event) => {
    event.preventDefault();
    if (message) socket.emit('sendMessage', message, () => setMessage('')); //Отправка сообщения, и очистка текущего сообщения, для очистики input-а
 };


 //InfoBar - Панель сверху, на ней располагаются кнопки
 //WebChatClient - Логика видеотрансляции на клиенте
 //webChatStreamer - Видеотраналсяция на стримере
 //Messages - Коллекция сообщений
 //Input - Инпут сообщения
 //UsersList - Список пользователей комнаты
 return (  
    <div className="outerContainer">
      <div className="myContainer">
        <InfoBar socket={socket} room={room} globalVideoChatStatus={globalVideoChatStatus} setLocalVideoChatStatus={setLocalVideoChatStatus} localVideoChatStatus={localVideoChatStatus}/> {/* Infobar сверху страницы, принимает в себя комнату для отображения ссылки приглашения */}

        {globalVideoChatStatus ? <WebChatClient socket={socket}/>
        : localVideoChatStatus ? <WebChatStreamer socket={socket} localVideoChatStatus={localVideoChatStatus} setLocalVideoChatStatus={setLocalVideoChatStatus}/> : null}

        <Messages messages={messages} name={name}/>                               {/* Модуль отрисовки сообщений, применяется после получения обработанного сообщения с сервера*/}
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>     {/* Инпут сообщений, формирует и отправляет сообщение на сервер*/}
      </div>
     <UsersList users={users}/>                                                      {/* Список пользователей */}
    </div>
  );
};


export {socket};
export default Chat;




