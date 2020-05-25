import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import uuidv4 from "uuid/v4";
import io from "socket.io-client";
import './Join.css';
import { Redirect } from 'react-router-dom'
import { socket } from '../Chat/Chat';
import { useDispatch } from 'react-redux'; 

//Данный компонент отвечает за домашнюю страницу, с которой пользователь попадает в случайную комнату

const Join = () =>{
  const [name, setName] = useState('');
  const [room, setRoom] = useState(''); 
  const [nameValidation, setNameValidation] = useState('Name'); //validation статусы отвечают за placeholder-ы инпутов, обработка ошибок будет вестись через них
  const [roomValidation, setRoomValidation] = useState('Room');
  const [authStatus, setAuthStatus] = useState(false); //Статус аутентификации.
  const [ENDPOINT] = useState ("localhost:80"); //Endpoint сокета

  //Имя пользователя и комната передаются в основной компонент чата с помощью Redux-а
  //В данной форме проводится лишь первичная проверка и обработа данных пользователя
  //Подключение к сокетам и комнате происходит в главном компоненте Chat.js
  const dispatch = useDispatch();


  useEffect( () => {
      //Сброс имеющейся сессии, в случае возвращения из комнаты на страницу логина.
      //Для отключения клиента от комнаты, с последующим удалением из списка пользователей
      if (socket) {
          socket.close();
          dispatch( { type: "SET_NAME", payload: "" } );
          dispatch( { type: "SET_ROOM", payload: "" } );
       };

    }, [dispatch])

  if (authStatus) return <Redirect to={`/chat`}/> //В случае если пользователь прошёл валидацию - редирект на чат.

  return (
      <div className="joinOuterContainer">
          <div className="joinInnerContainer">
              <h1 className="heading">Join</h1>
              <div>
                  <input                          //Инпут имени
                      placeholder={nameValidation} 
                      value={name} 
                      className="joinInput" 
                      type="text" maxLength="16" 
                      onChange={ (event) => setName(event.target.value)}
                    />
               </div>

               <div>
                   <input 
                      placeholder={roomValidation}           //Инпут комнаты
                      value={room} 
                      className="joinInput" 
                      type="text" maxLength="45" 
                      onChange={ (event) => setRoom(event.target.value)}
                    />
                </div>

               {/*  Перенаправление в рандомную комнату чата после валидного инпута */}
               {/* Здесь можно добавить ?room=${room}, чтобы пользователь мог сразу скопировать ссылку для приглашения, без нажатия на соответсвующую кнопку в чате */}

                <Link to={`/chat`}>
                  <button 
                      className="button mt-20" 
                      type="submit"
                      onClick={ (event) => {                   //Кнопка с рандомной комнатой
                          let validNickname = name.replace(/\s/g, ''); //Проверка инпута на пробелы

                          if (validNickname === "") {  //В случае если инпут пуст/содержит только пробелы - плейсхолдер сменяется на ошибку
                              event.preventDefault(); 
                              setNameValidation("Name cannot be empty"); 
                              setName(""); 
                            } else {               
                              //Отправка полученного с инпута имени, и рандомной комнаты в store
                              //для дальнейшего их получения на странице чата
                              dispatch( { type: "SET_NAME", payload: name } );
                              dispatch( { type: "SET_ROOM", payload: uuidv4() } );
                            };
                        }}
                  >Join random room</button>
               </Link> 
 

               <button                      //Кнопка выбора конкретной комнаты
                  className="button mt-20" 
                  type="submit"
                  onClick={(event) =>  {
                      let validRoom = room.replace(/\s/g, '');  //Проверка никнейма и комнаты на отсутствие значения
                      let validNickname = name.replace(/\s/g, '');

                      if (validNickname === "") {
                          event.preventDefault(); 
                          setNameValidation("Name cannot be empty"); //Обработка ошибки в имени
                          setName(""); 
                       } else if (validRoom === "") {
                          setRoomValidation("Room cannot be empty"); //Обработка ошибки в комнате
                          event.preventDefault(); 
                          setRoom(""); 
                       } else {
                          event.preventDefault(); //Если всё отлично - соединяемся с сервером для проверки никнейма
                          let socket;
                          socket = io(ENDPOINT);

                          socket.emit('checkNickname', { name, room } , (error) => {  //Запрос на проверку никнейма. Если такой в комнате уже имеется - возвращается ошибка.          
                              if(error) { 
                                  setNameValidation("Name already exists"); //Обрабатываем ошибку
                                  setName("");
                                  socket.close();
                               } else { 
                                  socket.close(); //В ином случае отключаемся от сокета
                                  dispatch( { type: "SET_NAME", payload: name } ); //Отправляем в стор никнейм и комнату, в компонента чата их получим
                                  dispatch( { type: "SET_ROOM", payload: room } );
                                  setAuthStatus(true);                                   //Меняется статус аутентификации для дальнейшего редиректа в чат
                               };
                           });
                       };
                   }}
               >Join room</button>            
           </div>
       </div>
    );
};

export default Join;
