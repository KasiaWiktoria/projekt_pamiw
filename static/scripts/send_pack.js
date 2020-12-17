import {addCorrectMessage, addfailureMessage} from './form_functions.js';
import {isAnyFieldBlank} from './validation_functions.js';
import {GET, POST, paczkomatURL, HTTP_STATUS, PACK_ID_FIELD_ID, PASSWD_FIELD_ID} from './const.js'

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


function submitPackForm(form, name) {
    let packUrl = paczkomatURL + name;
    console.log(packUrl);
    console.log(form)
    let failureMessage = "Paczka o podanym id nie istnieje.";

    let params = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
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
        addCorrectMessage(id,response.message)
    }else {
        addfailureMessage(id,response.message)
    }
}
