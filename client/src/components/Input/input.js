import React, {useState} from 'react';
import './Input.css';



//Компонент формы инпута чата

const Input = ({message, setMessage, sendMessage}) => { //Получение методов рабоыт с сообщением

    const [validation, setvalidation] = useState("Type a message.."); //State для обработки ошибок input-а, с помощью его placeholder-а
    
return (
<form className="form">
<input className="input"
type="text"
maxlength="1600"
placeholder={validation}
value={message} 
onChange={(event)=> setMessage(event.target.value)}
onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}/>
<button className="sendButton" 
onClick={(event)=> {
    event.preventDefault();

    let validationMessage = message.replace(/\s/g, ''); //Валидация сообщения. Проверка на пустое сообщение

    if(validationMessage === "") { setvalidation("Message cannot be empty"); setMessage(""); }  //В случае пустого сообщения placeholder отображает ошибку

    else {sendMessage(event); setvalidation("Type a message..")}; //В случае успешной валидации происходит отправка сообщения через функцию sendMessage (Описана в Chat.js)
}
}>Send</button>

</form>
)
}

export default Input;
