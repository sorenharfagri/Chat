import React, {useState} from "react";
import "./ChatJoinForm.css";

//Компонент формы логина, который пользователь получает на странице чата, если он не имеет никнейма

const ChatJoinForm = ({socket, name, setName, room, setLoginStatus}) => {
    const [validationStatus, setValidationStatus] = useState('Name'); //Инпут формы, с его помощью отображаются ошибки

    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
                <h1 className="heading">Login</h1>
                <div>
                    <input
                        placeholder={validationStatus}
                        value={name}
                        className="joinInput"
                        type="text"
                        maxLength="16"
                        onChange={event => setName(event.target.value)}/>
                </div>

                <button
                    className="button mt-20"
                    type="submit"
                    onClick={event => { //При нажатии кнопки происходит валидация
                        let validNickname = name.replace(/\s/g, ''); //Проверка инпута на отсутствие значения
                        if (validNickname === "") {

                            event.preventDefault();
                            setValidationStatus("Name cannot be empty");  //Устанавлиаем статус ошибки в плейсхолдер инпута
                            setName("");                                 //Очищаем инпут
                        } else {
                            socket.emit('join', {name, room}, (error) => {  //Запрос на подключение к комнате.
                                if (error) {
                                    setValidationStatus("Name already exists");  //В случае ошибки отображаем её в placeholder-е
                                    setName("");
                                } else {                     //В случае успешного подключения меняется статус логина, поэтому в последующем рендере форма логина не будет отображена
                                    setLoginStatus("ConnectedFromLoginForm");
                                }
                                ;
                            });
                        }
                    }}
                >Sign In
                </button>
            </div>
        </div>
    );
};

export default ChatJoinForm;