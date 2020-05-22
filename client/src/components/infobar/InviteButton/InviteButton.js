import React, {useState} from 'react';
import {Button, Modal} from 'react-bootstrap';
import {CopyToClipboard} from 'react-copy-to-clipboard';

//Данный компонент отвечает за инвайт пользователя в комнату


const InviteButton = ({room}) => {
    const [isShow, setShow] = useState(false);                      //Стейт отвечающий за отображение всплываюещго окна
    const url = window.location.hostname+":3000/chat?room="+room;

        return (
        <Button className="child-button" variant="light" onClick={(e)=>setShow(!isShow)}>Invite friend
       {isShow ? <>
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
      </Button>
    )
};

export default InviteButton;