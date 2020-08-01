import React, {useEffect, useState} from "react";
import "./ChatJoinForm.css";
import {joinRoom, resetLoginError} from "../../../redux/actions/loginActions";
import {useSelector, useDispatch} from "react-redux";
import { checkName } from "../../Join/loginMethods.js";

//Компонент формы логина, который пользователь получает на странице чата, если он не имеет никнейма

const ChatJoinForm = ({room}) => {
    //Инпут формы, с его помощью отображаются ошибки
    const [nameValidation, setNameValidation] = useState('Name');
    //Ошибка при проверке имени на повторяющееся значение
    const error = useSelector(state => state.login.loginError);

    const [name, setName] = useState('');
    const dispatch = useDispatch();



    //Хук для обработки ошибки при логине
    useEffect(() => {
        if (error) {
            setNameValidation(error)
            setName('')
            dispatch(resetLoginError())
        }

    }, [error])


    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
                <h1 className="heading">Login</h1>
                <div>
                    <input
                        placeholder={nameValidation}
                        value={name}
                        className="joinInput"
                        type="text"
                        maxLength="16"
                        onChange={event => setName(event.target.value)}/>
                </div>

                <button
                    className="button mt-20"
                    type="submit"
                    onClick={event => { //При нажатии кнопки происходит валидация
                        event.preventDefault();
                        if (checkName(name, setName, setNameValidation)) dispatch(joinRoom(name, room))
                    }}
                >Sign In
                </button>
            </div>
        </div>
    );
};

export default ChatJoinForm;