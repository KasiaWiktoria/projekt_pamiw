import { joinIntoRoom } from './websocket_functions.js'
import { websocketURL } from './const.js'

const HAND_OVER_ROOM = "hand_over_room"

document.addEventListener("DOMContentLoaded", function (event) {

    let ws_uri = websocketURL;
    socket = io.connect(ws_uri);

    joinIntoRoom(HAND_OVER_ROOM)


    socket.on("change_pack_status", function (pack_id) {
        console.log("(courier) zmieniono status paczki ", pack_id);
    });

    socket.on("connect", function(){
        console.log('Correctly connected.')
    })

    socket.on("joined_room", function (message) {
        console.log("Joined to the room ", message);
    });

    socket.on("chat_message", function (data) {
        updatePacksList()
        console.log("Receiven new chat message: ", data);
    });

    
});


