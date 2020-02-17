import React from 'react';
import './Message.css';
import ReactEmoji from 'react-emoji'; //Использован для emoji внутри чата

//Модель сообщения
//Принимает все необходимые для сообщения данные с сервера, обрабаытвает их, и возвращает готовое для отрисовки сообщение


const Message = ({message: {user, text, date}, name}) => {  //Получение информации о сообщении

let isSentByCurrentUser = false;               //Если сообщение послано от текущего пользователя (юзера), то оно будет выводиться на стороне юзера особым образом

const trimmedName = name.trim().toLowerCase(); //Форматирование имени отправителя для проверки

if (user === trimmedName)  isSentByCurrentUser = true;       //Сравнение имени отправителя с именем юзера     


return (
    isSentByCurrentUser  /* Вывод сообщения в случае отправки юзером */
    ? (
    <div className="messageContainer justifyEnd">
    <p className="sentText pr-10">{trimmedName}</p>
    <div className="messageBox backgroundBlue">
    <p className="messageText colorWhite">{ReactEmoji.emojify(text)}</p>
    <p>{date}</p>
    </div>
    </div>
    )
    :
    (
    <div className="messageContainer justifyStart">
    <div className="messageBox backgroundLight">
    <p className="messageText colorDark">{ReactEmoji.emojify(text)}</p>
    <p className="messageText colorDark">{date}</p>
    </div>
    {date ? <p className="sentText pl-10">{user}</p> : null} {/* У некоторых сообщений нет даты (Приветствие при подключении), поэтому происходит проверка перед отправкой*/}
    </div>
    )
)

};




export default Message;
