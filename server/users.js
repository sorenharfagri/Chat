//Данный модуль содержит в себе методы для добавления/удаления/получения пользователя


const users = []; //Массив подключенных к комнате пользователей

const addUser = ({ id, name, room }) => { //Добавление в комнату нового пользователя. id = socket.id
  name = name.trim().toLowerCase(); //Валидация
  room = room.trim().toLowerCase();

  const existingUser = users.find((user) => user.room === room && user.name === name); //Проверка на существующего в комнате пользователя

  //Обработка ошибок, в случае которых добавление не происходит
  if(!name || !room) return { error: 'Username and room are required.' }; 
  if(existingUser) return { error: 'Username is taken.' };

  const user = { id, name, room }; //В случае успешной валидации - функция возвращает пользователя для дальнейшей отправки сокетом

  users.push(user); //Добавление в список подключенных к комнате пользователей

  return { user };
}

const removeUser = (id) => { //Удаление пользователя из списка подключенных
  const index = users.findIndex((user) => user.id === id); //Поиск в массиве имеющихся пользователей

  if(index !== -1) return users.splice(index, 1)[0]; //Удаление из массива
}

const getUser = (id) => users.find((user) => user.id === id); //Получение пользователя из массива по socket.id. Используется для идентификации отправителя сообщения

const getUsersInRoom = (room) => users.filter((user) => user.room === room); //Получение списка пользователей комнаты


const checkNickname = ({name, room}) => //Проверка на потворяющийся никенйм в комнате.
{
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase(); 
  const existingUser = users.find((user) => user.room === room && user.name === name);
  if(existingUser) return { error: 'Username is taken.' };
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom, checkNickname };