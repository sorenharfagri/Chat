import React, {useState, useEffect} from 'react';
import uuidv4 from "uuid/v4";
import './Join.css';
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux';
import {checkNickname, resetLoginError, setLoginError} from "../../redux/actions/joinActions";
import {changeName, changeRoom} from "../../redux/actions/userActions";

//Данный компонент отвечает за домашнюю страницу, с которой пользователь попадает в чат

//Имя пользователя и комната передаются в основной компонент чата с помощью Redux-а
//В данной форме проводится лишь первичная проверка и обработа данных пользователя
//Подключение к сокетам и комнате происходит в главном компоненте Chat.js

const Join = () => {

    //Локальные имя и пасс
    //Используются в инпуте
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');

    //Имя и пасс со стора
    //Если оба будут иметь значения - произойдёт редирект в чат
    const storeName = useSelector(state => state.user.name);
    const storeRoom = useSelector(state => state.user.room);

    //validation статусы отвечают за placeholder-ы инпутов, обработка ошибок будет вестись через них
    const [nameValidation, setNameValidation] = useState('Name');
    const [roomValidation, setRoomValidation] = useState('Room');

    const dispatch = useDispatch();
    const history = useHistory();

    //Ошибка при проверке имени на повторяющееся значение
    const error = useSelector(state => state.login.loginError);

    //Редирект в чат
    //В query можно добавить комнату
    //Чтобы пользователь мог сразу скопировать ссылку для приглашения в чат
    function redirect() {
        history.push("/chat");
    }

    //Вспомогательные функции для аутентификации
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
    //Функция для аутентификации при выборе конкретной комнаты
    //Проводятся проверки на пустые значения
    //Если проверки проходят успешно - Redux с помощью сокетов обрабатывает данные
    //Если никнейм повторяется - loginError в сторе примет ошибку, которую обработает хук
    //Если же с данными всё отлично - в сторе обновятся никнейм и комната, хук заметив это произведёт редирект в чат
    function auth(name, room) {
        if (checkRoom(room) & checkName(name)) {
            dispatch(checkNickname(name, room))
        }
    }

    //Хук для обработки ошибки при логине
    useEffect(() => {

        if (error) {
            setNameValidation(error)
            setName('')
            dispatch(resetLoginError())
        }

    }, [error])

    //Хук отслеживающий имя и комнату со стора
    //Если такове будут получены - произойдёт редирект в чат
    useEffect(() => {
        if (storeName && storeRoom) redirect();

    }, [storeName, storeRoom])


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
                            dispatch(changeName(name));
                            dispatch(changeRoom(uuidv4()));
                            redirect();
                        }
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
