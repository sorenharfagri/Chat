import React from "react";
import {Button} from "react-bootstrap";
import {startStream} from "../../../../redux/actions/chatActions";

//Компонент отвечает за логику кнопки, которая включает/выключает видеотрансляцию

const WebcamButton = ({setIsStreamer, isStreamer}) => {

    return (
        <>
            <Button
                className="child-button"
                variant="light"
                onClick={() => {
                    if (!isStreamer) {                          //В случае если кнопка ранее не была нажата
                        setIsStreamer(!isStreamer); //Устанавливаем локальный статус, который задействует компонент отвечающий за трансляцию на стороне стримера
                    } else {                                          //В случае повторного нажатия убираем компонент
                        setIsStreamer(!isStreamer);                   //Возвращаем статус в исходное состояние
                        startStream();     //Оповещаем пользователей об окончании трансляции
                    }
                }}
            >{isStreamer ? "Turn off webcam" : "Turn on webcam"}</Button>
        </>
    );
};

export default WebcamButton;