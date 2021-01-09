import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, courierURL, HTTP_STATUS, PACK_ID_FIELD_ID, PASSWD_FIELD_ID} from './const.js'

document.addEventListener('DOMContentLoaded', function (event) {


    prepareEventOnChange(PACK_ID_FIELD_ID, isBlank);
    
    let packForm = document.getElementById("pick-up-form");

    packForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let pack = document.getElementById(PACK_ID_FIELD_ID);

        let fields = [pack];
        if(!isAnyFieldBlank(fields)) {
            submitPackForm(packForm, 'pick_up_pack');
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Wpisz identyfikator paczki.")
        }
    });
});

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
    let successMessage = "Paczka o podanym id jest w bazie.";
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
                console.log(form)
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            });
}

function getJsonResponse(response){
    return response.json();
}


function getResponse(response) {
    let id = "button-submit-form";
    if (response.status == HTTP_STATUS.OK){
        console.log('Udało się!')
        addCorrectMessage(id,response.message)
    }else if (response.status == HTTP_STATUS.BAD_REQUEST){
        addfailureMessage(id,' Status tej paczki został już zmieniony.')
    }else {
        console.log(response.message)
        addfailureMessage(id,response.message)
    }
}