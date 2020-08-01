import React from 'react';
import './infoBar.css';
import onlineIcon from '../../../icons/onlineIcon.png';
import closeIcon from '../../../icons/closeIcon.png';
import InviteButton from "./InviteButton/InviteButton";
import WebcamButton from "./WebcamButton/WebcamButton";

//Компонент является панелью сверху страницы
//Отвечает за кнопки на ней

const InfoBar = ({room, isStream, setIsStreamer, isStreamer}) => {

    //InviteButton - отвечает за инвайт пользователя в комнату
    //WebcamButton - отвечает за включение/отключение видеотрансляции
    return (
        <div className="infoBar">
            <div className="leftInnerContainer">
                <img className="onlineIcon" src={onlineIcon} alt="online"></img>
                <InviteButton room={room}/>
                {!isStream ?
                    <WebcamButton
                        setIsStreamer={setIsStreamer}
                        isStreamer={isStreamer}
                    />
                    : null}
            </div>

            <div className="rightInnerContainer">
                <a href="/">
                    <img src={closeIcon} alt="close"/>
                </a>
            </div>
        </div>
    );
};

export default InfoBar;