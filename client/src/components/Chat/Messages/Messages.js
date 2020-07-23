import React from 'react';
import './Messages.css';
import ScrollToBottom from 'react-scroll-to-bottom';
import Message from './Message/Message';
import uuidv4 from "uuid/v4";


//Компонент для отрисовки сообщений
//Принимает массив с сообщениями
//Итерируется по нему и создаёт сообщения с помощью компоненнта Message
//Name пользователя передаётся в message чтобы выделить отправителя сообщения

const Messages = ({messages, name}) => (
    <ScrollToBottom className="messages">
        {messages.map((message) =>
            <div key={uuidv4()}>
                <Message
                    message={message}
                    name={name}
                    date={message.date}
                />
            </div>
        )}
    </ScrollToBottom>
);


export default Messages;
