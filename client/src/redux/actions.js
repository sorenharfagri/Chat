import {RESET_USER_DATA, SET_NAME, SET_ROOM} from "./types";

export function changeName(name) {
    return {
        type: SET_NAME,
        payload: name
    }
}

export function changeRoom(room) {
    return {
        type: SET_ROOM,
        payload: room
    }
}

export function resetUserData() {
    return {
        type: RESET_USER_DATA,
    }
}