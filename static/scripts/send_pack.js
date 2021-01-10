import {addCorrectMessage, addfailureMessage, prepareEventOnChange} from './form_functions.js';
import {isAnyFieldBlank} from './validation_functions.js';
import {GET, POST, paczkomatURL, HTTP_STATUS, PACK_ID_FIELD_ID, PASSWD_FIELD_ID, websocketURL} from './const.js'

const PUT_PACK_IN_ROOM = "put_pack_in_room"

document.addEventListener('DOMContentLoaded', function (event) {
    
    let ws_uri = websocketURL;
    let socket = io.connect(ws_uri);

    joinIntoRoom(PUT_PACK_IN_ROOM);

    socket.on("connect", function(){
        console.log('Correctly connected.')
    })

    socket.on("joined_room", function (message) {
        console.log("Joined to the room ", message);
    });

    prepareEventOnChange(PACK_ID_FIELD_ID, isBlank);
    let packForm = document.getElementById("pack-form");

    packForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let pack = document.getElementById(PACK_ID_FIELD_ID);

        let fields = [pack];
        if(!isAnyFieldBlank(fields)) {
            submitPackForm(packForm, 'put_in');
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Wpisz identyfikator paczki.")
        }
    });

    
    function joinIntoRoom(room_id) {
        let useragent = navigator.userAgent;
        socket.emit("join", { useragent: useragent, room_id: room_id });
    }
    
    function sendMessage(room_id, text) {
        let data = { room_id: room_id, message: text };
        socket.emit("new_message", data);
    }

        
    function isBlank(){
        let field = document.getElementById(PACK_ID_FIELD_ID);
        let fields = [field];
        if (!isAnyFieldBlank(fields)){
            return ""
        } else{
            return  "not blank"
        }
    }


    function submitPackForm(form, name) {
        let packUrl = paczkomatURL + name;
        console.log(packUrl);
        console.log(form)
        let failureMessage = "Paczka o podanym id nie istnieje.";
        let form_to_fetch = new FormData(form)
        let path = window.location.pathname
        let paczkomat = path.split('/')[2]
        form_to_fetch.append('paczkomat', paczkomat)

        let params = {
            method: POST,
            mode: 'cors',
            body: form_to_fetch,
            redirect: "follow"
        };

        fetch(packUrl, params).then(response => getJsonResponse(response)).then(response => putPackIn(response))
                .catch(err => {
                    console.log("Caught error: " + err);
                    console.log(form)
                    let id = "button-submit-form";
                    addfailureMessage(id,failureMessage);
                });
    }

    function getJsonResponse(response){
        return response.json();
    }

    function putPackIn(response) {
        let id = "button-submit-form";
        if (response.status == HTTP_STATUS.OK){
            console.log('Udało się!')
            sendMessage(PUT_PACK_IN_ROOM, "Paczka włożona do paczkomatu.")
            addCorrectMessage(id,response.message)
        }else {
            addfailureMessage(id,response.message)
        }
    }
});

