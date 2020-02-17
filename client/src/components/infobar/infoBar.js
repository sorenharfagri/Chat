import React, {useState} from 'react';
import './infoBar.css';
import onlineIcon from '../../icons/onlineIcon.png';
import closeIcon from '../../icons/closeIcon.png';
import {Button, Modal} from 'react-bootstrap';
import {CopyToClipboard} from 'react-copy-to-clipboard';

//Данный компонент содержит в себе кнопку с инвайтом

const InfoBar = ({room}) => {  //Принимает в себя комнату
const [isShow, setShow] = useState(false); //Стейт для отображения/скрытия modal

const url = window.location.hostname+":3000/chat?room="+room; //Получение url комнаты 


//По нажатию кнопки появляется всплывающее окно с ссылкой в данный чат
//К сожалению, не успел вынести modal в отдельный компонент.
return (
<div className="infoBar">
    <div className="leftInnerContainer">
<img className="onlineIcon" src={onlineIcon} alt="online"></img>
<Button variant="light" onClick={(e)=>setShow(!isShow)}>Invite friend</Button>
{isShow  ? <> 
      <Modal size="lg" show={isShow} onHide={()=>setShow(!isShow)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite</Modal.Title>
        </Modal.Header>
        <Modal.Body>To invite you have to copy this link and send to your guest</Modal.Body>
        <Modal.Body>{url}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShow(!isShow)}>
            Close
          </Button>
          <CopyToClipboard text={url}>
          <Button variant="primary" onClick={()=>setShow(!isShow)}>
            Copy and close
          </Button>
          </CopyToClipboard>
        </Modal.Footer>
      </Modal>
    </> : null}

    </div>
    <div className="rightInnerContainer">
<a href="/"><img src={closeIcon} alt="close"/></a>
    </div>
</div>
)

};

export default InfoBar;