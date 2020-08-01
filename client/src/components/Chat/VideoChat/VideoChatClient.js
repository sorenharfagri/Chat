import React, {useState, useEffect} from "react";
import "./VideoChat.css";
import { socket } from "../../../redux/actions/sockets.js";

//Данный модуль отвечает за видеочат на стороне клиента

let pc; //Резерв для peerconnection


const iceServers = {
    'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]
};

const VideoChatClient = () => {
    const [localVideoref] = useState(React.createRef()); //Ссылка для отображения стрима

    //Работа с сокетами
    useEffect(() => {


        //Получение оффера со стримера, установко удалённого и локального описания, отправление ответа стримеру
        socket.on(`GetOfferFromStreamer`, streamerdesc => {


            //Обработка ошибок на уровне установления локалього/удалённого sdp
            const onSetRemoteDescriptionError = (e) => console.log(`Error in setRemoteDescription ${e}`);

            const onSetLocalDescriptionError = (e) => console.log(`Error in setLocalDescription ${e}`);


            //В случае успешной установки удалённого sdp, создаём ответ
            const onSetRemoteSuccess = () => {
                pc.createAnswer()
                    .then(
                        onCreateAnswerSuccess,
                        onSetRemoteDescriptionError
                    );
            };

            //В случае успешного создания ответа, устанавливаем локальный sdp
            const onCreateAnswerSuccess = (desc) => {

                pc.setLocalDescription(new RTCSessionDescription(desc))
                    .then(
                        onSetLocalDescriptionSuccess(desc),
                        onSetLocalDescriptionError
                    )
            }

            //В случае успешного установления локалього sdp, отправляем его стримеру
            const onSetLocalDescriptionSuccess = (desc) => {
                socket.emit("AnswerForStreamer", desc, socket.id)
            }

            //Установка удалённого и локального описания, отправка ответа стримеру
            pc.setRemoteDescription(streamerdesc)
                .then(
                    onSetRemoteSuccess,
                    onSetRemoteDescriptionError
                );

        });


        //Получение кандидатов от стримера
        socket.on(`GetCandidates`, candidate => {

            //Обработка успешого добавления кандидата
            const onAddIceCandidateSuccess = () => console.log(`Added ice candidate`);

            //Обработка ошибки при добавлении кандидата
            const onIceCandidateError = (e) => console.log(`Error on addIceCandidate ${e}`);

            //Добавляем кандидата
            pc.addIceCandidate(new RTCIceCandidate(candidate))
                .then(
                    onAddIceCandidateSuccess(candidate),
                    onIceCandidateError
                );
        });


        return () => {
            socket.off(`GetOfferFromStreamer`);
            socket.off(`GetCandidates`);
        }

    }, []);


    //Создаём новое подключение, обрабатываем логику на пире
    useEffect(() => {

        pc = new RTCPeerConnection(iceServers);


        //Получаем стрим при его наличии
        pc.ontrack = (e) => {
            localVideoref.current.srcObject = e.streams[0];
        };


        //Получаем и отправляем кандидатов стримеру
        pc.onicecandidate = (e) => {

            if (e.candidate) {
                console.log(`Candidate sent`);

                socket.emit("CandidateForStreamer", e.candidate, socket.id);
            }
        };


        //Отправляем оповещение на сервер о появлении нового пира
        //Сервер в свою очередь уведомит об этом стримера
        //Стример же создаст для нового пира оффер, и перешлёт его клиенту

        socket.emit("NewPeer", socket.id);

        return () => {
            pc.close();
        };

    }, [localVideoref]);


    return (
        <div className="webOuter">
            <video
                className="WebBox"
                autoPlay
                controls
                controlsList="nodownload noremoteplayback"
                ref={localVideoref}
            >
            </video>
        </div>
    )
}

export default VideoChatClient;