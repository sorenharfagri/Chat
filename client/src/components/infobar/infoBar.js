import React from 'react';
import './infoBar.css';
import onlineIcon from '../../icons/onlineIcon.png';
import closeIcon from '../../icons/closeIcon.png';
import {Button} from 'react-bootstrap';

import InviteButton from "./InviteButton/InviteButton";

//Данный компонент содержит в себе кнопку с инвайтом в комнату

const InfoBar = ({room, isShowWeb, setShowWeb}) => {


//По нажатию inviteButton появляется всплывающее окно с ссылкой в данный чат

return (
<div className="infoBar">
    <div className="leftInnerContainer">
<img className="onlineIcon" src={onlineIcon} alt="online"></img>
<InviteButton room={room}/> 
<div className="child-button">
<Button variant="light" >Turn on web</Button>
</div>
    </div>
    <div className="rightInnerContainer">
<a href="/"><img src={closeIcon} alt="close"/></a>
    </div>
</div>
)

};

export default InfoBar;