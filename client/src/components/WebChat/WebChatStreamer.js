import React, {useState, useEffect} from "react";
import "./WebChat.css";

//Данный компонент отвечает за логику видеотрансляции на стримере


var stream;                    //Используется для получения стрима в переменную, в дальнейшем для добавления трансляции в пир
var peerConnections = {};      //Содержит в себе всех подключенных пиров


const constraints = {video: true, audio: true};
const offerOptions = {
offerToReceiveVideo: 1,
offerToReceiveAudio: 1
};



const iceServers = {
  'iceServers': [ {'urls': 'stun:stun.l.google.com:19302'} ]
};

const WebChatStreamer = ({socket, localVideoChatStatus, setLocalVideoChatStatus}) =>{
  const [localVideoref] = useState(React.createRef());


  //Стример
  useEffect(() => {
    console.log("useEffect did mount");


    //Функции для getUserMedia

    const failure = (e) => {
      alert(e)          //Событие, в случае отказа
      setLocalVideoChatStatus(!localVideoChatStatus)
    }     
    //Создание подключения, прослушивание ice кандидатов

    const success = (translation) => {                   //Событие, в случае получения девайсов
      stream = translation;                                //Получение медиа в переменную, для дальнейшего добавления трансляций

      localVideoref.current.srcObject = stream;            //Получаем локальный стрим для наблюдения своей физиономии на видеокамере
      console.log("Stream added");
      socket.emit("videoChatConnect");                    //Оповещаем клиентов в комнате о начале трансляции
    };

    navigator.mediaDevices.getUserMedia(constraints)  //Получение разрешение на использование девайсов от пользователя
    .then(success)
    .catch(failure);


    return () => {             //Обработка отключения стрима
      if(stream){
        stream.getTracks().forEach(track => track.stop()); //Отключение медиатрансляции
        console.log("Endup the stream");
      }
    };
        
  }, [localVideoref, socket, localVideoChatStatus, setLocalVideoChatStatus]);



  useEffect(() => {
    console.log("Use layout effect initialized");

    //Функция для создания создания нового пира
    
    const createPeerConnection = (socketID, callback) => {
      console.log("Emmited createPeerConnection");

      try { 
        let pc = new RTCPeerConnection(iceServers); //Создаём новый пир

        if (stream) {                     //Добавляем в него ранее полученный стрим
          pc.addStream(stream);
          console.log("Stream added in peer connection");
        }

        //Добавляем новоиспечённый пир в коллекцию соединений
        //Уникальным идентификатором пира, для обращения к нему, является socketID получаемый с сервера
        peerConnections = {...peerConnections, [socketID]: pc}; 

        console.log(`New peer connection with id ${socketID} initialized`);


        pc.onicecandidate = (e) => { //Отправляем кандидатов на клиента
          if(e.candidate) {
            console.log(`Candidate sent`);
            socket.emit(`CandidateForClient`, e.candidate, socketID);
          } else console.log("All candidates sent");
        }

        pc.close = () => console.log("Peer connection closed");

        callback(pc);

      } catch(e) { //Отлавливаем ошибку
        alert(`Something went wrong! pc not created!!, ${e}`)
        callback(null);
      } 
    }

    //Сокеты для работы с подключениями на стримере

    //Подключение нового пира
    socket.on("NewPeerOnStreamer", (socketID) => {
      console.log("Got new offer");

      createPeerConnection(socketID, pc => {  //Создание нового пира, уникальным идентификатором подключения служит socketid, который передаётся с сервера. 
 
        if (pc) 
        pc.createOffer(offerOptions) //В случае успешного создания формируем оффер, устанавливаем локальное описание
        .then(sdp => {
          pc.setLocalDescription(sdp);
          console.log(`Local description set, pc created with id ${socketID}`)
          socket.emit("OfferFromStreamer", sdp, socketID );       //Отправляем описание на клиента
        })
      })
    });

    //Сокет для получения кандидатов от клиентов   
    socket.on("GetCandidateOnStreamer", (candidate, socketID) => { 
      let pc = peerConnections[socketID];

      if (pc) { //В случае если пир с полученным socketid существует, добавляем кандидата
        console.log(`Got candidate `);

        //Обработка успшеного добавления кандидата
        const onAddIceCandidateSuccess = () => console.log(`Added ice candidate`);

        //Обработка ошибки при добавлении кандидата
        const onAddIceCandidateError = (e) => console.log(`Error on addIceCandidate ${e}`);
    
        pc.addIceCandidate(new RTCIceCandidate(candidate) )
          .then (
            onAddIceCandidateSuccess(candidate),
            onAddIceCandidateError
          )   
      } else { //В ином случае отлавливаем ошибку
        console.log("Something went wrong in socket GetCandidateOnStreamer");
        console.log(`Pc is ${pc}`);
        console.log(`Socket id is ${socketID}`);
      };
    });


    //Сокет для получения ответа от клиента
    socket.on("GotAnswerOnStreamer", (desc, socketID) => {
      const pc = peerConnections[socketID]; //Получаем необходимый пир

      const onSetRemoteDescriptionSuccess = () => console.log("Remote description set complete");

      const onSetRemoteDescriptionError = (e) => console.log(`Error on set remote description, ${e}`);

      //Устанавливаем описание клиента
      pc.setRemoteDescription(new RTCSessionDescription(desc) )
        .then (
          onSetRemoteDescriptionSuccess,
          onSetRemoteDescriptionError
        )
    });

    return () => { 
      console.log("disconnected");
      socket.off("NewPeerOnStreamer");
      socket.off("GotAnswerOnStreamer");
      socket.off("GetCandidateOnStreamer");
    };
             
  });


  console.log("Component did mount");

  return (
     <div className="webOuter">
         <video 
             className="WebBox" 
             autoPlay 
             muted
             controls
             controlsList="nodownload noremoteplayback"
             ref={localVideoref}>
         </video>
     </div>
    );
};

export default WebChatStreamer;