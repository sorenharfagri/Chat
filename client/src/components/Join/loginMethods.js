//Вспомогательные функции для аутентификации с инпутов
//Проводят первичные проверки на пустое значение
//Если значение не проходит проверку - возвращается false, плейсхолдер инпута меняются на ошибку

// @room: string;
// @setRoom: fn, сеттер стейта отвечающего за значение инпута
// @setPlaceholder: fn, сеттер стейта, отвечающего за значение плейсхолдера
// return boolean

export function checkRoom(room, setRoom, setPlaceholder) {
    let validationStatus = true;
    room = room.trim();

    if (room === "") {
        setPlaceholder("Room cannot be empty"); //Обработка ошибки в комнате
        setRoom("");
        validationStatus = false;
    } else {
        setPlaceholder("Room")
    }
    return validationStatus
}

// @room: string;
// @setName: fn, сеттер стейта отвечающего за значение инпута
// @setPlaceholder: fn, сеттер стейта, отвечающего за значение плейсхолдера
// return boolean
export function checkName(name, setName, setPlaceholder) {
    let validationStatus = true;
    name = name.trim();

    if (name === "") {
        setPlaceholder("Name cannot be empty"); //Обработка ошибки в имени
        setName("");
        validationStatus = false;
    } else {
        setPlaceholder("Name")
    }
    return validationStatus;
}