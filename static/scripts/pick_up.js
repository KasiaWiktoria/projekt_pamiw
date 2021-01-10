import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, courierURL, HTTP_STATUS, PACK_ID_FIELD_ID, PASSWD_FIELD_ID, websocketURL} from './const.js'
import { sendMessage, joinIntoRoom } from './websocket_functions.js';

const HAND_OVER_ROOM = "hand_over_room"

document.addEventListener('DOMContentLoaded', function (event) {
    console.log('poprawnie załadowany skrypt')
    let ws_uri = websocketURL;
    let socket = io.connect(ws_uri);
    joinIntoRoom(HAND_OVER_ROOM)

    socket.on("connect", function(){
        console.log('Correctly connected.')
    })

    prepareEventOnChange(PACK_ID_FIELD_ID, isBlank);
    
    let packForm = document.getElementById("pick-up-form");

    packForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let pack = document.getElementById(PACK_ID_FIELD_ID);
        
        let fields = [pack];
        if(!isAnyFieldBlank(fields)) {
            console.log('przed fetch')
            submitPackForm(packForm, 'pick_up_pack');
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
        let packUrl = courierURL + name;
        console.log(packUrl);
        console.log(form)
        let failureMessage = "Paczka o podanym id nie istnieje.";
    
        let params = {
            method: POST,
            mode: 'cors',
            body: new FormData(form),
            redirect: "follow"
        };
    
        fetch(packUrl, params).then(response => {
            console.log("odpowiedź: " + response)
            return getJsonResponse(response)
            }).then(response => getResponse(response))
                .catch(err => {
                    console.log("Caught error: " + err);
                    let id = "button-submit-form";
                    addfailureMessage(id,failureMessage);
                });
    }
    
    function getJsonResponse(response){
        console.log('po fetch')
        return response.json();
    }
    
    
    function getResponse(response) {
        let id = "button-submit-form";
        if (response.status == HTTP_STATUS.OK){
            console.log('Udało się!')
            sendMessage(HAND_OVER_ROOM, 'Poprawnie odebrano paczkę.')
            addCorrectMessage(id,response.message)
        }else if (response.status == HTTP_STATUS.BAD_REQUEST){
            addfailureMessage(id,' Status tej paczki został już zmieniony.')
        }else {
            console.log(response.message)
            addfailureMessage(id,response.message)
        }
    }
});