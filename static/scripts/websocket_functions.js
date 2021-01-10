
export function joinIntoRoom(room_id) {
    let useragent = navigator.userAgent;
    socket.emit("join", { useragent: useragent, room_id: room_id });
}

export function sendMessage(room_id, text) {
    data = { room_id: room_id, message: text };
    socket.emit("new_message", data);
}