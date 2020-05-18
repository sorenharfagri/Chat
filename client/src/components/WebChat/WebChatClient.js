import React, {useState, useEffect} from "react";
import "./WebChat.css";

//Данный модуль отвечает за видеочат на стороне клиента

var clientdesc = "";
var pc;


const iceServers = {
  'iceServers': [ {'urls': 'stun:stun.l.google.com:19302'} ]
};

const WebChatClient = ({socket}) => {
  const [localVideoref] = useState(React.createRef()); //Ссылка для отображения стрима
  const [socketStatus, setSocketStatus] = useState(false); //Статус используется для активизации лисенеров на сокетах

  //Работа с сокетами
  useEffect(() => {
    console.log(`Socket id is ${socket.id}`)
 

    //Получение оффера со стримера, установко удалённого и локального описания, отправление ответа стримеру
    socket.on(`${socket.id}:GetOfferFromStreamer`, streamerdesc => {
      console.log("Get offer socket emitted")


 
      //Обработка ошибок на уровне установления локалього/удалённого sdp
      const onSetRemoteDescriptionError = (e) => console.log(`Error in setRemoteDescription ${e}`);
 
      const onSetLocalDescriptionError = (e) => console.log(`Error in setLocalDescription ${e}`);
               

      //В случае успешной установки удалённого sdp, создаём ответ
      const onSetRemoteSuccess = () => {
        console.log("Remote description set complete");
        pc.createAnswer()
        .then (
          onCreateAnswerSuccess,
          onSetRemoteDescriptionError
        );
      };      
               
      //В случае успешного создания ответа, устанавливаем локальный sdp
      const onCreateAnswerSuccess = (desc) => {
        console.log(`Answer created`);
 
        pc.setLocalDescription(new RTCSessionDescription(desc))
        .then (
          onSetLocalDescriptionSuccess(desc),
          onSetLocalDescriptionError
        )
      }

      //В случае успешного установления локалього sdp, отправляем его стримеру
      const onSetLocalDescriptionSuccess = (desc) => {
        console.log(`Local description set and sent`)
        socket.emit("AnswerForStreamer", desc, socket.id)
      }               
               
      //Установка удалённого и локального описания, отправка ответа стримеру
      pc.setRemoteDescription(streamerdesc)
      .then (
        onSetRemoteSuccess,
        onSetRemoteDescriptionError
      ); 

    });


    //Получение кандидатов от стримера
    socket.on(`${socket.id}:GetCandidates`, candidate => {
      console.log("Get candidates socket emitted")

      //Обработка успешого добавления кандидата
      const onAddIceCandidateSuccess = () => console.log(`Added ice candidate`);
 
      //Обработка ошибки при добавлении кандидата
      const onIceCandidateError = (e) => console.log(`Error on addIceCandidate ${e}`);
     
      //Добавляем кандидата
      pc.addIceCandidate(new RTCIceCandidate(candidate) )
      .then (
        onAddIceCandidateSuccess(candidate),
        onIceCandidateError
      );             
    });       

    console.log("Sockets initialized")

    return () => {
      socket.off(`${socket.id}:GetOfferFromStreamer`);
      socket.off(`${socket.id}:GetCandidates`);
      console.log("Disconnected")
    }

  }, [socketStatus, socket]);



  //Создаём новое подключение, обрабатываем логику на пире
  useEffect(() => {

    pc = new RTCPeerConnection(iceServers);
      
    console.log("Peer connection initialized on client");
          
    //Получаем стрим при его наличии
    pc.ontrack = (e) =>{
      localVideoref.current.srcObject = e.streams[0];
      console.log("Got the stream");
    };



    //Получаем и отправляем кандидатов стримеру
    pc.onicecandidate = (e) => {

      if(e.candidate) {
        console.log(`Candidate sent`);

        socket.emit("CandidateForStreamer", e.candidate, socket.id);
      } else if(clientdesc) {   
        console.log("All candidates was sent");
      };
    };

    setSocketStatus(true); //Подключаем сокеты


    //Отправляем оповещение на сервер о появлении нового пира
    //Сервер в свою очередь уведомит об этом стримера
    //Стример же создаст для нового пира оффер, и перешлёт его клиенту

    socket.emit("NewPeer", socket.id);
    console.log("Sent request for offer");


    return () => {
      console.log("Disconnected");
      pc.close();
    };
  
  },[socket, localVideoref]);


 console.log("Component did mount");

 return (
    <div className="webOuter">
      <video 
        className="WebBox" 
        autoPlay
        controls
        controlsList="nodownload noremoteplayback"
        ref={localVideoref}></video>
    </div>
  )
}

export default WebChatClient;