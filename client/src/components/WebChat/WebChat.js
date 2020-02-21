import React, {useState, useEffect} from "react";
import "./WebChat.css";




const WebChat = () => {
const [localVideoref] = useState(React.createRef())
const [remoteVideoref] = useState(React.createRef()) //Получение Dom для дальнейшего взаимодействия
  

useEffect(() => {


const constraints = {video: true};


const success = (stream) => {                   //Событие, в случае получения девайсов
    localVideoref.current.srcObject = stream 
};

const failure = (e) => 
{
    alert(`getUserMedia error(${e})`)          //Событие, в случае отказа
}


navigator.mediaDevices.getUserMedia(constraints)  //Получение разрешение на использование девайсов от юзера
.then(success) //Если разрешение получено
.catch(failure) //Если не получено
                //Если не получено

}, [localVideoref]);



       return (
           <>
        <div className="WebcamBox">
            <video className="WebBox" autoPlay ref={localVideoref}></video>
            <video className="WebBox" autoPlay ref={localVideoref}></video> 
        </div>
        </>
    )
    
}



export default WebChat;


/* (async () => {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)  //Получение разрешение на использование девайсов от юзера
    .success(stream) //Если разрешение получено
    .catch(failure) //Если не получено
    
    })().catch(failure) //Если не получено
    Ошибка -> (ReferenceError: Cannot access 'stream' before initialization) */