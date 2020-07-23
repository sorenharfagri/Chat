import React, {useState} from 'react';
import uuidv4 from "uuid/v4";
import io from "socket.io-client";
import './Join.css';
import {useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux';
import {changeName, changeRoom} from "../../redux/actions";

//Данный компонент отвечает за домашнюю страницу, с которой пользователь попадает в чат

//Имя пользователя и комната передаются в основной компонент чата с помощью Redux-а
//В данной форме проводится лишь первичная проверка и обработа данных пользователя
//Подключение к сокетам и комнате происходит в главном компоненте Chat.js

//Ендпоинт сокета
const ENDPOINT = "localhost:80/chat"

const Join = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');

    //validation статусы отвечают за placeholder-ы инпутов, обработка ошибок будет вестись через них
    const [nameValidation, setNameValidation] = useState('Name');
    const [roomValidation, setRoomValidation] = useState('Room');

    const dispatch = useDispatch();
    const history = useHistory();

    //Редирект в чат
    //В query можно добавить комнату
    //Чтобы пользователь мог сразу скопировать ссылку для приглашения в чат
    function redirect() {
        history.push("/chat");
    }

    //Функции для аутентификации
    //Проводятся первичные проверки на пустое значение
    //Если значение не проходит проверку - возвращается false, плейсхолдер инпута меняются на ошибку

    // @room: string;
    // return boolean
    function checkRoom(room) {
        let validationStatus = true;
        room = room.trim();

        if (room === "") {
            setRoomValidation("Room cannot be empty"); //Обработка ошибки в комнате
            setRoom("");
            validationStatus = false;
        }
        return validationStatus
    }

    // @name: string;
    // return boolean
    function checkName(name) {
        let validationStatus = true;
        name = name.trim();

        if (name === "") {
            setNameValidation("Name cannot be empty"); //Обработка ошибки в имени
            setName("");
            validationStatus = false;
        }
        return validationStatus;
    }


    // @name: string;
    // @room: string;
    // return boolean

    //Функция для аутентификации, при выборе конкретной комнаты
    //Проводятся проверки на пустые значения, повторяющийся никнейм в комнате
    //Если проверки проходят успешно - в стор отправляется имя и комната, происходит редирект в чат
    function auth(name, room) {
        let validationStatus = checkRoom(room) & checkName(name);

        if (validationStatus) {
            let socket = io(ENDPOINT);

            //Запрос на проверку никнейма. Если такой в комнате уже имеется - возвращается ошибка.
            socket.emit('checkNickname', {name, room}, (error) => {
                if (error) {
                    setNameValidation("Name already exists");
                    setName("");
                    validationStatus = false;
                } else {
                    //Отправляем в стор никнейм и комнату, в компоненте чата их получим
                    dispatch(changeRoom(room));
                    dispatch(changeName(name));
                    redirect()
                }
                socket.close();
            });
        }


        return validationStatus;
    }


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
                        onChange={event => setName(event.target.value)}
                    />
                </div>

                <div>
                    <input
                        placeholder={roomValidation}           //Инпут комнаты
                        value={room}
                        className="joinInput"
                        type="text" maxLength="45"
                        onChange={event => setRoom(event.target.value)}
                    />
                </div>

                {/*Кнопка с рандомной комнатой*/}
                <button
                    className="button mt-20"
                    type="submit"
                    onClick={event => {
                        event.preventDefault();
                        if (checkName(name)) {
                            //Отправка полученного с инпута имени, и рандомной комнаты в store
                            //Для дальнейшего их получения на странице чата
                            dispatch({type: "SET_NAME", payload: name});
                            dispatch({type: "SET_ROOM", payload: uuidv4()});
                            redirect();
                        }
                        ;
                    }}
                >Join random room</button>


                {/*Кнопка выбора конкретной комнаты*/}
                <button
                    className="button mt-20"
                    type="submit"
                    onClick={event => {
                        event.preventDefault();
                        auth(name, room)
                    }}
                >Join room</button>
            </div>
        </div>
    );
};

export default Join;
