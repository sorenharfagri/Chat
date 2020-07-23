import React from 'react';
import {Link} from 'react-router-dom';
import picture from './picture.jpeg';

//Страника для 404 ошибки

const NotFound = () => (
    <div>
        <img src={picture} alt="Page not found" style={{
            width: 400,
            height: 400,
            display: 'block',
            margin: 'auto',
            position: 'relative'
        }}
        />
        <center>Woops, looks like page not found</center>
        <center><Link to="/">Return to Home Page </Link></center>
    </div>
);

export default NotFound;