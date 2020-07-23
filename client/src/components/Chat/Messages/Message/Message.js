import React from 'react';
import './Message.css';
import ReactEmoji from 'react-emoji';

//Компонент одного сообщения
//Отрисовывается с помощью Messages

//user - отправтиель сообщения
//name - текущий пользователь
const Message = ({message: {user, text, date}, name}) => {

    let isSentByCurrentUser = false;
    const trimmedName = name.trim().toLowerCase();

    //Если сообщение послано от текущего пользователя , то оно будет выводиться на стороне пользователя особым образом
    if (user === trimmedName) isSentByCurrentUser = true;


    return (
        isSentByCurrentUser ? (
            <div className="messageContainer justifyEnd">
                <p className="sentText pr-10">{trimmedName}</p>
                <div className="messageBox backgroundBlue">
                    <p className="messageText colorWhite">{ReactEmoji.emojify(text)}</p>
                    <p>{date}</p>
                </div>
            </div>
        ) : (
            <div className="messageContainer justifyStart">
                <div className="messageBox backgroundLight">
                    <p className="messageText colorDark">{ReactEmoji.emojify(text)}</p>
                    <p className="messageText colorDark">{date}</p>
                </div>
                {/* У некоторых сообщений нет даты (Приветствие при подключении), поэтому происходит проверка перед отправкой*/}
                {date ? <p className="sentText pl-10">{user}</p> : null}
            </div>
        )
    )
};

export default Message;
