import React, { useState, useEffect } from 'react';
import  { Redirect } from 'react-router-dom'
import { store } from "../../index";
import io from "socket.io-client";
import queryString from 'query-string';

import Messages from "../Messages/Messages";
import InfoBar from '../infobar/infoBar';
import Input from '../Input/input.js';
import UsersList from '../UsersList/UsersList';

import './Chat.css';

//Данный компонент отвечает за страницу чата, и логику сокетов на клиентской части

let socket; //Резерв для сокета
var name; //Резерв для имени



const Chat = ({location}) => {      //location - объект роутера содержащий в себе информацию о текущем url

    const [reduxStore, setReduxStore] = useState(store.getState());
    store.subscribe(() =>{
    setReduxStore(store.getState());
       });

    const [message, setMessage] = useState(''); //Сообщение 
    const [messages, setMessages] = useState([]); //Массив сообщений
    const [users, setUsers] = useState('');       //Массив пользователей комнаты
    const [validationStatus, setvalidationStatus] = useState('Name');  //Placeholder input-а
    const [loginValidation, setloginValidation] = useState(false);  //Статус валидации. Использутся для отправки формы Login-а, в случае, если пользователь не залогинен
    const [loginName, setLoginName] = useState(""); //Используется для формы логина
    const [query] = useState(queryString.parse(location.search)) //Получение комнаты query строки

  function getRoom () {                          //Функция для получения комнаты
  let room = reduxStore.room //Получение комнаты со stor-а
  if(room) {return room} 
  else if(query.room) { return query.room} //В случае неудачи - получение комнаты с query строки
  else return ("");  //В случае отсутствия у пользователя комнаты - возвращается пустое значение, которое в дальнейшем будет обработано.
  }
    const [room] = useState(getRoom); //Получение комнаты пользователя

    const ENDPOINT = 'localhost:5000'; //Endpoint сокета
  

    name = reduxStore.name; //Получение имени со stor-а Вынужденная мера, к сожалению, не успел сделать рефакторинг.





                           
    //Обработка подключения
    useEffect(() => {

      if(!room && !name) return undefined; //В случае если комнаты и имени не получено - подключение к сокету не происходит, в дальнейшем произойдёт редирект на хоумпейдж
      

      if(reduxStore.notConnected) socket = io(ENDPOINT); //Если пользователь не подключен - происходит подключение к сокету

      if(!query.room || query.room && name) {                  //Если пользоатель подключается не с query-строки, или же подключается со страницы логина - происходит подключение. Не успел в рефакторинг.
      socket.emit('join', { name, room }, (error) => {         //Подтверждение валидации
        error ? alert(error) :  setloginValidation(true);     //Потверждение валидации, для избежания повтороного логина
          });
        }
    }, [ENDPOINT, query.room, reduxStore.notConnected, room]);


    
    //Обработка сообщений и списка пользователей
    useEffect(() => {

       if(!room && !name) return undefined;

        socket.on('message', (message) => {             //Получение обработанного сообщения с сервера, добавление в список сообщений, дальнейший его рендер
          setMessages([...messages, message ]);
        });
    
        socket.on('roomData', ({ users }) => {         //Получение данных о пользователях комнаты
          setUsers(users); 
        })
    
        return () => {                          //Обрабокта отключения
          socket.emit('disconnect');
          console.log("User disconnected");
          socket.off();
        }
      }, [messages, room])




if (!room & !name) return <Redirect to='/' />//Редирект на Join, если у пользователя нет комнаты и имени.


     //Если пользователь не имеет никнейма, его перекидывает в компонент с логином
     //К сожалению, не успел вынести его в отдельный компонент


if(!loginValidation && !name) { 
  return ( 
    <div className="joinOuterContainer">
    <div className="joinInnerContainer">
    <h1 className="heading">Login</h1>
    <div><input placeholder={validationStatus} value={loginName} className="joinInput" type="text" maxlength="16" onChange={(event) => setLoginName(event.target.value)}/></div>
   <button onClick={(event) =>  {
                name = loginName;
                let validNickname = name.replace(/\s/g, ''); //Проверка инпута на отсутствие значения
                if (validNickname === "")  {setvalidationStatus("Name cannot be empty"); setLoginName(""); event.preventDefault();} 
                else
                {
                 store.dispatch({type:"NOT_CONNECTED", payload:false}); //Уведомление о том, что пользователь уже подключен к сокету, и дальнейше подключение не требуется
                 socket.emit('join', { name, room } , (error) =>        //Запрос на подключение к комнате.
                 {    

                  if(error) //В случае ошибки меняется placeholder
                  {
                    setvalidationStatus("Name already exists");
                    setLoginName("");
                  }
                  else //В случае успшеного подключения меняется статус валидации, поэтому в последующем форма логина не будет отображена
                  {
                    store.dispatch({type:"CHANGE_NAME", payload:name}); //Так-же в хранилище отправляется прошедший валидацию никнейм
                    setloginValidation(true);
                  }
                 });
                }
       
            }}className="button mt-20" type="submit">Sign In</button>
</div>
</div>
)
}






const sendMessage = (event) => //Первичная отправка сообщений на сервер. На сервере сообщение обрабатывается (Сообщение получает отправителя, и дату отправки), затем эмитится всей комнате.
{
    event.preventDefault();
    if(message) {
        socket.emit('sendMessage', message, () => setMessage('')); //Отправка сообщения, и очистка текущего сообщения, для очистики input-а
    }
};


return (  
<div className="outerContainer">
<div className="myContainer">
<InfoBar room={room} />                         {/* Infobar сверху страницы, принимает в себя комнату для отображения ссылки приглашения */}
    <Messages messages={messages} name={name}/>                                {/* Модуль отрисовки сообщений, применяется после получения обработанного сообщения с сервера*/}
<Input message={message} setMessage={setMessage} sendMessage={sendMessage}/>     {/* Инпут сообщений, формирует и отправляет сообщение на сервер*/}
</div>
<UsersList users={users}/>                                                      {/* Список пользователей */}
</div>

    );
};

export {socket};
export default Chat;




