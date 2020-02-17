import React from 'react';

import onlineIcon from '../../icons/onlineIcon.png';

import './UsersList.css';

//Компонент содержащий в сбе список пользователей

const UsersList = ({ users }) => (  //Принимает массив с пользователями
  <div className="textContainer">
    {
      users
        ? (
          <div className="inTextContainer">
            <h1 className="inTextHeader">People online</h1>
            <div className="activeContainer">
              <h2 className="activeItem">
                {users.map(({name}) => (                 //С помощью map отрисовывает каждого пользователя в список
                  <div key={name} className="activeItem"> 
                    {name}
                    <img alt="Online Icon" src={onlineIcon}/>
                  </div>
                ))}
              </h2>
            </div>
          </div>
        )
        : null
    }
  </div>
);

export default UsersList;