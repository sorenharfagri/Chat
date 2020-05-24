import React from 'react';
import './Messages.css';
import ScrollToBottom from 'react-scroll-to-bottom'; //Автоскролл страницы, при получении сообщения
import Message from './Message/Message';
import uuidv4 from "uuid/v4";


//Модуль для отрисовки сообщений
//Принимает объект с сообщениями
//Итерируется по нему и создаёт сообщения
//Само сообщение выведено в отдельный компонент

const Messages = ( { messages, name } ) => (
  <ScrollToBottom className="messages">
       { messages.map( (message) =>
          <div key={ uuidv4() } > 
              <Message 
                  message={message} 
                  name={name} 
                  date={messages.date}
               />
          </div> 
        )}
   </ScrollToBottom>
);




export default Messages;
