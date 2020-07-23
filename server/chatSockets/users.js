//Данный модуль содержит в себе методы для добавления/удаления/получения пользователя, так-же хранит их список

const users = [];

//Добавление в комнату нового пользователя. id = socket.id
const addUser = ({id, name, room}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Провярем существует ли пользователь
    const existingUser = users.find(user => user.room === room && user.name === name);

    //Обработка ошибок, в случае которых добавление не происходит
    if (!name || !room) return {error: 'Username and room are required.'};
    if (existingUser) return {error: 'Username is taken.'};

    //В случае успешной валидации - функция возвращает пользователя
    const user = {id, name, room};

    //Добавление в список подключенных к комнате пользователе
    users.push(user);

    return {user};
}

//Удаление пользователя из списка подключенных
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) return users.splice(index, 1)[0];
}

//Получение пользователя по socket.id
const getUser = (id) => users.find((user) => user.id === id);

//Получение списка пользователей комнаты
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

//Проверка на повторяющийся никенйм в комнате.
const checkNickname = ({name, room}) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    const existingUser = users.find(user => user.room === room && user.name === name);
    if (existingUser) return {error: 'Username is taken.'};
}

module.exports = {addUser, removeUser, getUser, getUsersInRoom, checkNickname};