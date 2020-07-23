import React, {useState} from 'react';
import './Input.css';


//Компонент инпута чата

const Input = ({message, setMessage, sendMessage}) => {


    //State для обработки ошибок input-а, с помощью его placeholder-а
    //В случае попытки отправки пустого сообщение меняется на "Message cannot be empty"
    //В случае успешной отправки сообщения меняется на изначальное значение
    const [validation, setValidation] = useState("Type a message..");


    const messageValidation = (event) => { //Валидация сообщения
        event.preventDefault();
        let validationMessage = message.replace(/\s/g, ''); //Проверка на пустое сообщение

        if (validationMessage === "") {  //В случае пустого сообщения placeholder отображает ошибку
            setValidation("Message cannot be empty");
            setMessage("");
        } else {  //В случае успешной валидации происходит отправка сообщения через функцию sendMessage (Описана в Chat.js)
            sendMessage(event);
            setValidation("Type a message..")
        }
        ;
    };

    return (
        <form className="form">
            <input
                className="input"
                type="text"
                maxLength="1600"
                placeholder={validation}
                value={message}
                onChange={event => setMessage(event.target.value)} //При изменений инпута месседж записывается в стейт Message
                onKeyPress={event => event.key === 'Enter' ? messageValidation(event) : null}
            />
            <button
                className="sendButton"
                onClick={event => messageValidation(event)}
            >Send
            </button>
        </form>
    );
};

export default Input;