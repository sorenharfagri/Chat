import React from 'react';
import './Messages.css';
import ScrollToBottom from 'react-scroll-to-bottom'; //Автоскролл страницы, при получении сообщения
import Message from './Message/Message';


//Модуль для отрисовки сообщений

const Messages = ({messages, name}) => (   //Принимает в себя полученное с сервера сообщение и его данные. Далее направляет данные в компонент сообщения, модель которого выведена в отдельный компонент
<ScrollToBottom className="messages">
{messages.map((message, i) => <div key={i}><Message message={message} name={name} date={messages.date}/></div>)} {/* Отрисовка имеющихся сообщений */}
</ScrollToBottom>
);




export default Messages;