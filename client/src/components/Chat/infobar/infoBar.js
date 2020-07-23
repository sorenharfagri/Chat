import React from 'react';
import './infoBar.css';
import onlineIcon from '../../../icons/onlineIcon.png';
import closeIcon from '../../../icons/closeIcon.png';
import InviteButton from "./InviteButton/InviteButton";
import WebcamButton from "./WebcamButton/WebcamButton";

//Данный компонент содержит в себе кнопку с инвайтом в комнату

const InfoBar = ({room, globalVideoChatStatus, setLocalVideoChatStatus, socket, localVideoChatStatus}) => {

    //InviteButton - овтечает за инвайт пользователя в комнату
    //WebcamButton - отвечает за включение/отключение видеотрансляции
    return (
        <div className="infoBar">
            <div className="leftInnerContainer">
                <img className="onlineIcon" src={onlineIcon} alt="online"></img>
                <InviteButton room={room}/>
                {!globalVideoChatStatus ?
                    <WebcamButton
                        socket={socket}
                        setLocalVideoChatStatus={setLocalVideoChatStatus}
                        localVideoChatStatus={localVideoChatStatus}
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