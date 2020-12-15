import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateName, validateSurname, validateBDate, validatePesel, validateCountry, validatePostalCode, validateCity, validateStreet, validateHouseNr, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, courierURL, HTTP_STATUS, PACK_ID_FIELD_ID, PASSWD_FIELD_ID} from './const.js'

let packForm = document.getElementById("pick-up-form");

packForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let pack = document.getElementById(PACK_ID_FIELD_ID);

    let fields = [pack];
    if(!isAnyFieldBlank(fields)) {
        submitPackForm(packForm, 'check_pack_id');
    } else {
        let id = "button-submit-form";
        addfailureMessage(id,"Wpisz identyfikator paczki.")
    }
});


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

    fetch(packUrl, params).then(response => putPackIn(form, response, successMessage, failureMessage))
            .catch(err => {
                console.log("Caught error: " + err);
                console.log(form)
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            });
}

function putPackIn(form, response, successMessage, failureMessage) {
    if (response.status == HTTP_STATUS.OK){
        let packUrl = courierURL + 'pick_up_pack';
        console.log(packUrl);
        let successMessage = "Poprawnie odebrano paczkę.";
        let failureMessage = "Nie udało się odebrać paczki.";

        let params = {
            method: POST,
            mode: 'cors',
            body: new FormData(form),
            redirect: "follow"
        };

        fetch(packUrl, params).then(response => getResponse(response, successMessage, failureMessage))
            .catch(err => {
                console.log("Caught error: " + err);
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            });
    }else {
        addfailureMessage(id,failureMessage)
    }
}


function getResponse(response, successMessage, failureMessage) {
    let id = "button-submit-form";
    if (response.status == HTTP_STATUS.OK){
        console.log('Udało się!')
        addCorrectMessage(id,successMessage)
    }else if (response.status == HTTP_STATUS.BAD_REQUEST){
        addfailureMessage(id,' Status tej paczki został już zmieniony.')
    }else {
        addfailureMessage(id,failureMessage)
    }
}