import React, {useState, useEffect} from "react";
import "./VideoChat.css";

//Данный компонент отвечает за логику видеотрансляции на стримере


let stream;                    //Используется для получения стрима в переменную, в дальнейшем для добавления трансляции в пир
let peerConnections = {};      //Содержит в себе всех подключенных пиров


const constraints = {video: true, audio: true};
const offerOptions = {
    offerToReceiveVideo: 1,
    offerToReceiveAudio: 1
};


const iceServers = {
    'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]
};

const VideoChatStreamer = ({socket, localVideoChatStatus, setLocalVideoChatStatus}) => {
    const [localVideoref] = useState(React.createRef());


    useEffect(() => {


        //Методы для getUserMedia

        const failure = (e) => {
            alert(e)          //Событие, в случае отказа
            setLocalVideoChatStatus(!localVideoChatStatus)
        }
        //Создание подключения, прослушивание ice кандидатов

        const success = (translation) => {                   //Событие, в случае получения девайсов
            stream = translation;                                //Получение медиа в переменную, для дальнейшего добавления трансляций

            localVideoref.current.srcObject = stream;            //Получаем локальный стрим для наблюдения своей физиономии на видеокамере
            socket.emit("videoChatConnect");                    //Оповещаем клиентов в комнате о начале трансляции
        };

        navigator.mediaDevices.getUserMedia(constraints)  //Получение разрешение на использование девайсов от пользователя
            .then(success)
            .catch(failure);


        return () => {             //Обработка отключения стрима
            if (stream) {
                stream.getTracks().forEach(track => track.stop()); //Отключение медиатрансляции
            }
        };

    }, [localVideoref, socket, localVideoChatStatus, setLocalVideoChatStatus]);


    useEffect(() => {

        //Функция для создания создания нового пира

        const createPeerConnection = (socketID, callback) => {

            try {
                let pc = new RTCPeerConnection(iceServers); //Создаём новый пир

                if (stream) {                     //Добавляем в него ранее полученный стрим
                    pc.addStream(stream);
                }

                //Добавляем новоиспечённый пир в коллекцию соединений
                //Уникальным идентификатором пира, для обращения к нему, является socketID получаемый с сервера
                peerConnections = {...peerConnections, [socketID]: pc};


                pc.onicecandidate = (e) => { //Отправляем кандидатов на клиента
                    if (e.candidate) {
                        socket.emit(`CandidateForClient`, e.candidate, socketID);
                    } else console.log("All candidates was sent");
                }

                pc.close = () => console.log("Peer connection closed");

                callback(pc);

            } catch (e) { //Отлавливаем ошибку
                alert(`Something went wrong! pc not created!!, ${e}`)
                callback(null);
            }

        }

        //Сокеты для работы с подключениями на стримере

        //Подключение нового пира
        socket.on("NewPeerOnStreamer", (socketID) => {

            createPeerConnection(socketID, pc => {  //Создание нового пира, уникальным идентификатором подключения служит socketid, который передаётся с сервера.

                if (pc)
                    pc.createOffer(offerOptions) //В случае успешного создания формируем оффер, устанавливаем локальное описание
                        .then(sdp => {
                            pc.setLocalDescription(sdp);
                            socket.emit("OfferFromStreamer", sdp, socketID);       //Отправляем описание на клиента
                        })
            })
        });

        //Сокет для получения кандидатов от клиентов
        socket.on("GetCandidateOnStreamer", (candidate, socketID) => {
            let pc = peerConnections[socketID];

            if (pc) { //В случае если пир с полученным socketid существует, добавляем кандидата

                //Обработка успшеного добавления кандидата
                const onAddIceCandidateSuccess = () => console.log(`Added ice candidate`);

                //Обработка ошибки при добавлении кандидата
                const onAddIceCandidateError = (e) => console.log(`Error on addIceCandidate ${e}`);

                pc.addIceCandidate(new RTCIceCandidate(candidate))
                    .then(
                        onAddIceCandidateSuccess(candidate),
                        onAddIceCandidateError
                    )
            }
        });


        //Сокет для получения ответа от клиента
        socket.on("GotAnswerOnStreamer", (desc, socketID) => {
            const pc = peerConnections[socketID]; //Получаем необходимый пир

            const onSetRemoteDescriptionSuccess = () => console.log("Remote description set complete");

            const onSetRemoteDescriptionError = (e) => console.log(`Error on set remote description, ${e}`);

            //Устанавливаем описание клиента
            pc.setRemoteDescription(new RTCSessionDescription(desc))
                .then(
                    onSetRemoteDescriptionSuccess,
                    onSetRemoteDescriptionError
                )
        });

        return () => {
            socket.off("NewPeerOnStreamer");
            socket.off("GotAnswerOnStreamer");
            socket.off("GetCandidateOnStreamer");
        };

    });


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

export default VideoChatStreamer;