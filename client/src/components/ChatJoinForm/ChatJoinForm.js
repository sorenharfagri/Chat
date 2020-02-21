import React, {useState} from "react";
import "./ChatJoinForm.css";

//Компонент формы логина, который пользователь может получить на странице чата, если он не имеет никнейма

const ChatJoinForm = ({socket, name, setName, room, setLoginStatus}) =>{
const [validationStatus, setvalidationStatus] = useState('Name'); //Инпут формы, с помощью него отображатся ошибки.

    return ( 
            <div className="joinOuterContainer">
            <div className="joinInnerContainer">
            <h1 className="heading">Login</h1>
            <div><input 
            placeholder={validationStatus} 
            value={name} 
            className="joinInput" 
            type="text" 
            maxLength="16"
            onChange={(event) => setName(event.target.value)}/>
            </div>
           <button onClick={(event) =>  { //При нажатии кнопки происходит валидация
                        let validNickname = name.replace(/\s/g, ''); //Проверка инпута на отсутствие значения
                        if (validNickname === "")  {setvalidationStatus("Name cannot be empty"); setName(""); event.preventDefault();} 
                        
                        else { socket.emit('join', { name, room } , (error) => {  //Запрос на подключение к комнате.
                          if(error) //В случае ошибки меняется placeholder
                          {
                            setvalidationStatus("Name already exists"); 
                            setName("");
                          }
                          else //В случае успешного подключения меняется статус логина, поэтому в последующем рендере форма логина не будет отображена
                          {
                            setLoginStatus("ConnectedFromLoginForm")
                          }
                         });
                        }
               
                    }}className="button mt-20" type="submit">Sign In</button>
        </div>
        </div>
        )


}

export default ChatJoinForm;