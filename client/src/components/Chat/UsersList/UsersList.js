import React from 'react';
import onlineIcon from '../../../icons/onlineIcon.png';
import './UsersList.css';
import {useSelector} from "react-redux";

//Список пользователей

const UsersList = () => {
    const users = useSelector(state => state.chat.users);

    return (
        <div className="textContainer">
            {users ? (
                <div className="inTextContainer">
                    <h1 className="inTextHeader">People online</h1>
                    <div className="activeContainer">
                        <h2 className="activeItem">
                            {users.map(({name}) => (
                                <div key={name} className="activeItem">
                                    {name}
                                    <img alt="Online Icon" src={onlineIcon}/>
                                </div>
                            ))}
                        </h2>
                    </div>
                </div>
            ) : null};
        </div>
    )
}

export default UsersList;