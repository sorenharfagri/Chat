import React from "react";
import {Button} from "react-bootstrap";

//Компонент отвечает за логику кнопки, которая включает/выключает видеотрансляцию

const WebcamButton = ({socket, setLocalVideoChatStatus, localVideoChatStatus}) => {                

  return (
    <>
      <Button 
        className="child-button"
        variant="light"
        onClick={ () => {
          if(!localVideoChatStatus) {                          //В случае если кнопка ранее не была нажата 
            console.log("Success");
            setLocalVideoChatStatus(!localVideoChatStatus); //Устанавливаем локальный статус, который задействует компонент отвечающий за стрим 
          } else {                                          //В случае повторного нажатия изменяем статус на обратное логическое значнеие, т.е убираем компонент
            setLocalVideoChatStatus(!localVideoChatStatus);
            console.log("Wanna turn off");
            socket.emit("videoChatConnect");             //Оповещаем пользователей об окончании трансляции
          };
        }} 
      >{localVideoChatStatus ? "Turn off webcam" : "Turn on webcam"}</Button>
   </>
  )    
};

export default WebcamButton;